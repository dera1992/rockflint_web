import django_filters
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D

from rockflint_web.ads.models import Listing


class ListingFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    latitude = django_filters.NumberFilter(method="filter_location")
    longitude = django_filters.NumberFilter(method="filter_location")
    radius_km = django_filters.NumberFilter(method="filter_location")

    promoted = django_filters.BooleanFilter(method="filter_promoted")

    class Meta:
        model = Listing
        fields = [
            "active",
            "category",
            "offer",
            "state",
            "lga",
            "bedrooms",
        ]

    def filter_promoted(self, queryset, name, value):
        # promoted=true -> has active promotion and not expired
        # promoted=false -> normal listings only
        if value is True:
            return queryset.filter(
                promotion__active=True,
                promotion__promoted_until__gt=django_filters.utils.timezone.now(),
            )
        if value is False:
            return queryset.exclude(
                promotion__active=True,
                promotion__promoted_until__gt=django_filters.utils.timezone.now(),
            )
        return queryset

    def filter_location(self, queryset, name, value):
        data = self.data
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        radius_km = data.get("radius_km") or data.get("radius")
        if latitude in (None, "") or longitude in (None, ""):
            return queryset
        try:
            latitude_value = float(latitude)
            longitude_value = float(longitude)
        except (TypeError, ValueError):
            return queryset
        try:
            radius_value = float(radius_km) if radius_km not in (None, "") else 10.0
        except (TypeError, ValueError):
            radius_value = 10.0
        if radius_value <= 0:
            return queryset
        point = Point(longitude_value, latitude_value, srid=4326)
        return queryset.filter(location__distance_lte=(point, D(km=radius_value)))
