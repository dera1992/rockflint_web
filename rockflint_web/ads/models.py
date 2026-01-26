# Create your models here.
# ads/models.py
import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import JSONField
from django.db.models import Q
from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.template.defaultfilters import slugify
from django.urls import reverse
from django.utils import timezone

from rockflint_web.users.models import Vendor

User = get_user_model()


def unique_slugify(instance, value, slug_field_name="slug"):
    """
    Generate a unique slug for instance.model based on value
    Appends short uuid suffix if needed.
    """
    slug_base = slugify(value)
    slug = slug_base
    Klass = instance.__class__
    counter = 0
    while (
        Klass.objects.filter(**{slug_field_name: slug}).exclude(pk=instance.pk).exists()
    ):
        counter += 1
        slug = f"{slug_base}-{uuid.uuid4().hex[:6]}"
        if counter > 5:
            # fallback: append timestamp
            slug = f"{slug_base}-{int(timezone.now().timestamp())}"
            break
    return slug


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slugify(self, self.name)
        super().save(*args, **kwargs)


class State(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class LGA(models.Model):
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name="lgas")
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = ("state", "name")
        ordering = ["state__name", "name"]

    def __str__(self):
        return f"{self.name}, {self.state.name}"


class Offer(models.Model):
    """
    E.g., 'For Sale', 'For Rent', 'Lease'
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slugify(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Feature(models.Model):
    """
    Reusable amenities/features (pool, gym, parking...)
    """

    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=100, blank=True, null=True)  # optional for UI

    def __str__(self):
        return self.name


class ListingQuerySet(models.QuerySet):
    def active(self):
        return self.filter(active=True)


class ListingManager(models.Manager):
    def get_queryset(self):
        return ListingQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()


class Listing(models.Model):
    """Refactored listing (previously Ads)"""

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="listings",
    )
    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, blank=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="listings",
    )
    offer = models.ForeignKey(Offer, on_delete=models.PROTECT, related_name="listings")
    state = models.ForeignKey(State, on_delete=models.PROTECT, related_name="listings")
    lga = models.ForeignKey(LGA, on_delete=models.PROTECT, related_name="listings")
    address = models.CharField(max_length=512, blank=True, null=True)

    # price & rent
    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        db_index=True,
        validators=[MinValueValidator(0)],
    )
    rent_period = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )  # monthly, yearly etc

    # property specs
    bedrooms = models.PositiveSmallIntegerField(blank=True, null=True, db_index=True)
    bathrooms = models.PositiveSmallIntegerField(blank=True, null=True)
    area = models.FloatField(blank=True, null=True, help_text="Area in sqft/meters")
    building_age_years = models.PositiveSmallIntegerField(blank=True, null=True)

    # flexible attributes - JSON for extensible data (e.g., custom fields)
    attributes = JSONField(
        default=dict,
        blank=True,
    )  # {"lot_size": "200m2", "furnishing": "furnished"}

    # amenities / features
    features = models.ManyToManyField(Feature, blank=True, related_name="listings")

    # control + metadata
    active = models.BooleanField(default=True, db_index=True)
    created = models.DateTimeField(auto_now_add=True, db_index=True)
    updated = models.DateTimeField(auto_now=True)
    # optional: integrate hit count lib or own view model
    # hit_count_generic = GenericRelation(HitCount, object_id_field='object_pk', related_query_name='hit_count_generic_relation')

    objects = ListingManager()

    class Meta:
        ordering = ["-created"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["category", "state", "lga"]),
            models.Index(fields=["price"]),
            models.Index(fields=["active"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "slug"],
                name="ads_listing_vendor_slug_unique",
            ),
        ]

    def __str__(self):
        return f"{self.title} — {self.vendor}"

    def get_absolute_url(self):
        return reverse("listings:detail", args=[self.pk, self.slug])

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slugify(self, self.title)
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        img = self.images.filter(is_primary=True).first()
        if img:
            return img.image.url
        first = self.images.first()
        return first.image.url if first else None


class ListingImage(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="listings/")
    caption = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False, db_index=True)
    order = models.PositiveSmallIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order", "-is_primary", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["listing"],
                condition=Q(is_primary=True),
                name="ads_listingimage_single_primary",
            ),
        ]

    def save(self, *args, **kwargs):
        # ensure there is only one primary image
        if self.is_primary:
            # unset other primary images
            ListingImage.objects.filter(listing=self.listing, is_primary=True).exclude(
                pk=self.pk,
            ).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.listing.title}"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "listing")
        ordering = ["-saved_at"]

    def __str__(self):
        return f"{self.user} saved {self.listing}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )  # 1-5
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        unique_together = (
            "user",
            "listing",
        )  # optional: one review per user per listing

    def __str__(self):
        return f"Review {self.rating} by {self.user} on {self.listing}"


class PromotedListing(models.Model):
    listing = models.OneToOneField(
        Listing,
        on_delete=models.CASCADE,
        related_name="promotion",
    )
    promoted_until = models.DateTimeField()
    created = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True, db_index=True)

    def __str__(self):
        return f"Promoted: {self.listing.title} until {self.promoted_until}"
