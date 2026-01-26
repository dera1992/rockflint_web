from django.contrib.gis.db import models
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("ads", "0002_listing_constraints_and_validators"),
    ]

    operations = [
        migrations.AddField(
            model_name="listing",
            name="location",
            field=models.PointField(blank=True, null=True, srid=4326),
        ),
    ]
