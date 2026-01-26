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

    def apply_promotion_ordering(self, queryset):
        now = timezone.now()
        return queryset.annotate(
            is_promoted=Case(
                When(promotion__active=True, promotion__promoted_until__gt=now, then=1),
                default=0,
                output_field=IntegerField(),
            ),
        ).order_by("-is_promoted", *self.ordering)

    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.IsAuthenticated()]
        return [p() for p in self.permission_classes]

    def get_queryset(self):
        queryset = self.base_queryset()
        queryset = self.apply_visibility_filters(queryset)
        return self.apply_promotion_ordering(queryset)

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
