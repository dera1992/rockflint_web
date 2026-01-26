from django.db import migrations
from django.db import models
from django.db.models import Q
from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator


class Migration(migrations.Migration):
    dependencies = [
        ("ads", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="listing",
            name="price",
            field=models.DecimalField(
                db_index=True,
                decimal_places=2,
                max_digits=14,
                validators=[MinValueValidator(0)],
            ),
        ),
        migrations.AlterField(
            model_name="review",
            name="rating",
            field=models.PositiveSmallIntegerField(
                validators=[MinValueValidator(1), MaxValueValidator(5)],
            ),
        ),
        migrations.AddConstraint(
            model_name="listing",
            constraint=models.UniqueConstraint(
                fields=("vendor", "slug"),
                name="ads_listing_vendor_slug_unique",
            ),
        ),
        migrations.AddConstraint(
            model_name="listingimage",
            constraint=models.UniqueConstraint(
                condition=Q(("is_primary", True)),
                fields=("listing",),
                name="ads_listingimage_single_primary",
            ),
        ),
    ]
