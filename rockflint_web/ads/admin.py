# Register your models here.
# ads/admin.py
from django.contrib import admin

from .models import Category
from .models import Favorite
from .models import Feature
from .models import Listing
from .models import ListingImage
from .models import Offer
from .models import PromotedListing
from .models import Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ("name", "icon")


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "vendor",
        "category",
        "state",
        "price",
        "active",
        "created",
    )
    list_filter = ("active", "category", "state", "offer")
    search_fields = ("title", "description", "vendor__user__username")
    readonly_fields = ("created", "updated")


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ("listing", "is_primary", "order")
    list_filter = ("is_primary",)
    ordering = ("listing", "order")


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "listing", "saved_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "listing", "rating", "created")


@admin.register(PromotedListing)
class PromotedListingAdmin(admin.ModelAdmin):
    list_display = ("listing", "promoted_until", "active")
