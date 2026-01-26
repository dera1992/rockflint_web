from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.db.models import Case
from django.db.models import IntegerField
from django.db.models import When
from django.utils import timezone
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from rockflint_web.ads.models import Favorite
from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import ListingImage
from rockflint_web.ads.recommendations import parse_price_tolerance
from rockflint_web.ads.recommendations import similar_listings_for

from .filters import ListingFilter
from .pagination import DefaultPagination
from .permissions import IsVendorOwnerOrReadOnly
from .serializers import ListingImageSerializer
from .serializers import ListingSerializer
from .serializers import ListingWriteSerializer
from .serializers import ReviewSerializer


class ListingViewSet(viewsets.ModelViewSet):
    """
    /api/listings/
    /api/listings/{id}/
    """

    serializer_class = ListingSerializer
    permission_classes = [IsVendorOwnerOrReadOnly]
    filterset_class = ListingFilter
    pagination_class = DefaultPagination

    search_fields = ["title", "description", "address"]
    ordering_fields = ["price", "created", "bedrooms"]
    ordering = ["-created"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ListingWriteSerializer
        return ListingSerializer

    def base_queryset(self):
        return Listing.objects.select_related(
            "vendor",
            "category",
            "offer",
            "state",
            "lga",
        ).prefetch_related("images", "features")

    def user_can_view_inactive(self):
        return self.request.user.is_authenticated and hasattr(
            self.request.user,
            "vendor",
        )

    def apply_visibility_filters(self, queryset):
        if self.action in ["list", "retrieve"]:
            if self.user_can_view_inactive():
                queryset = queryset.filter(
                    active=True,
                ) | queryset.filter(
                    vendor=self.request.user.vendor,
                )
                return queryset.distinct()
            return queryset.filter(active=True)
        return queryset

    def apply_promotion_ordering(self, queryset, include_distance=False):
        now = timezone.now()
        ordering = list(self.ordering)
        if include_distance:
            ordering = ["distance", *ordering]
        return queryset.annotate(
            is_promoted=Case(
                When(promotion__active=True, promotion__promoted_until__gt=now, then=1),
                default=0,
                output_field=IntegerField(),
            ),
        ).order_by("-is_promoted", *ordering)

    def get_distance_point(self):
        latitude = self.request.query_params.get("latitude")
        longitude = self.request.query_params.get("longitude")
        if latitude in (None, "") or longitude in (None, ""):
            return None
        try:
            latitude_value = float(latitude)
            longitude_value = float(longitude)
        except (TypeError, ValueError):
            return None
        return Point(longitude_value, latitude_value, srid=4326)

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated()]
        return [p() for p in self.permission_classes]

    def get_queryset(self):
        queryset = self.base_queryset()
        queryset = self.apply_visibility_filters(queryset)
        point = self.get_distance_point()
        if point:
            queryset = queryset.annotate(distance=Distance("location", point))
        return self.apply_promotion_ordering(
            queryset,
            include_distance=bool(point),
        )

    def perform_create(self, serializer):
        # Ensure vendor exists
        user = self.request.user
        if not hasattr(user, "vendor"):
            raise PermissionDenied("You must be a vendor to create listings.")
        serializer.save(vendor=user.vendor)

    # ---------- Extra Actions (Optional but very useful) ----------

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def toggle_favorite(self, request, pk=None):
        listing = self.get_object()
        fav, created = Favorite.objects.get_or_create(
            user=request.user,
            listing=listing,
        )
        if not created:
            fav.delete()
            return Response({"favorited": False})
        return Response({"favorited": True})

    @action(detail=True, methods=["get"])
    def reviews(self, request, pk=None):
        listing = self.get_object()
        qs = listing.reviews.select_related("user").all()
        return Response(ReviewSerializer(qs, many=True).data)

    @action(detail=True, methods=["get"])
    def recommendations(self, request, pk=None):
        listing = self.get_object()
        price_tolerance = parse_price_tolerance(
            request.query_params.get("price_tolerance"),
        )
        limit = request.query_params.get("limit")
        try:
            limit_value = int(limit) if limit else 6
        except (TypeError, ValueError):
            limit_value = 6
        if limit_value < 1:
            limit_value = 1
        if limit_value > 20:
            limit_value = 20
        qs = similar_listings_for(
            listing,
            price_tolerance=price_tolerance,
            limit=limit_value,
        )
        return Response(ListingSerializer(qs, many=True).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
    )
    def add_review(self, request, pk=None):
        listing = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, listing=listing)
        return Response(serializer.data, status=201)


class ListingImageViewSet(viewsets.ModelViewSet):
    """
    /api/listing-images/
    """

    serializer_class = ListingImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def base_queryset(self):
        return ListingImage.objects.select_related("listing")

    def get_queryset(self):
        return self.base_queryset().filter(
            listing__vendor__user=self.request.user,
        )

    def perform_create(self, serializer):
        # Only allow vendor owner to add images to their own listing
        listing = serializer.validated_data["listing"]
        if listing.vendor.user_id != self.request.user.id:
            raise PermissionDenied(
                "You cannot add images to another vendor's listing.",
            )
        serializer.save()
