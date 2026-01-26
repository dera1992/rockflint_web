from decimal import Decimal
from decimal import InvalidOperation

from django.db.models import F
from django.db.models.functions import Abs

from rockflint_web.ads.models import Listing


def parse_price_tolerance(value, default=Decimal("0.20")):
    if value in (None, ""):
        return default
    try:
        tolerance = Decimal(str(value))
    except (InvalidOperation, ValueError):
        return default
    if tolerance < 0:
        return default
    if tolerance > 1:
        return Decimal("1.00")
    return tolerance


def similar_listings_for(listing, *, price_tolerance=Decimal("0.20"), limit=6):
    if listing.price is None:
        return Listing.objects.none()

    tolerance = parse_price_tolerance(price_tolerance)
    lower_bound = listing.price * (Decimal("1.00") - tolerance)
    upper_bound = listing.price * (Decimal("1.00") + tolerance)
    if lower_bound < 0:
        lower_bound = Decimal("0.00")

    return (
        Listing.objects.active()
        .select_related("vendor", "category", "offer", "state", "lga")
        .prefetch_related("images", "features")
        .filter(
            category=listing.category,
            price__gte=lower_bound,
            price__lte=upper_bound,
        )
        .exclude(pk=listing.pk)
        .annotate(price_delta=Abs(F("price") - listing.price))
        .order_by("price_delta", "-created")[:limit]
    )
