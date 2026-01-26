import django_filters

from rockflint_web.ads.models import Listing


class ListingFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")

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
