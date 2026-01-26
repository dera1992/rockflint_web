from django.db.models import Avg
from rest_framework import permissions
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from rockflint_web.ads.models import Favorite
from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import Review
from rockflint_web.users.models import Vendor

from .serializers import AgentActivitySerializer
from .serializers import AgentDashboardSerializer
from .serializers import VendorSerializer


class VendorViewSet(viewsets.ModelViewSet):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.select_related("user")
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        if hasattr(self.request.user, "vendor"):
            return queryset.filter(id=self.request.user.vendor_id)
        return queryset.none()

    def get_permissions(self):
        if self.action in ["list", "create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff can create vendors.")
        serializer.save()

    def _get_vendor(self):
        vendor = self.get_object()
        if not self.request.user.is_staff and self.request.user.vendor_id != vendor.id:
            raise PermissionDenied("You do not have access to this vendor.")
        return vendor

    def _build_activities(self, vendor, limit):
        listing_qs = Listing.objects.filter(vendor=vendor).order_by("-created")[:limit]
        review_qs = (
            Review.objects.filter(listing__vendor=vendor)
            .select_related("user", "listing")
            .order_by("-created")[:limit]
        )

        activities = []
        for listing in listing_qs:
            activities.append(
                {
                    "activity_type": "listing_created",
                    "created": listing.created,
                    "summary": f"Listing created: {listing.title}",
                    "listing_id": listing.id,
                    "listing_title": listing.title,
                    "actor": vendor.user.name or vendor.user.username,
                }
            )
        for review in review_qs:
            activities.append(
                {
                    "activity_type": "review_added",
                    "created": review.created,
                    "summary": f"Review by {review.user} on {review.listing.title}",
                    "listing_id": review.listing_id,
                    "listing_title": review.listing.title,
                    "actor": str(review.user),
                }
            )

        activities.sort(key=lambda item: item["created"], reverse=True)
        return activities[:limit]

    @action(detail=True, methods=["get"])
    def dashboard(self, request, pk=None):
        vendor = self._get_vendor()
        listing_qs = Listing.objects.filter(vendor=vendor)
        review_qs = Review.objects.filter(listing__vendor=vendor)
        average_rating = review_qs.aggregate(avg=Avg("rating"))["avg"] or 0.0
        favorites_count = Favorite.objects.filter(listing__vendor=vendor).count()

        recent_listings = listing_qs.order_by("-created")[:5]
        recent_reviews = review_qs.select_related("user", "listing").order_by("-created")[
            :5
        ]
        activities = self._build_activities(vendor, limit=10)

        payload = {
            "vendor": vendor,
            "total_listings": listing_qs.count(),
            "active_listings": listing_qs.filter(active=True).count(),
            "inactive_listings": listing_qs.filter(active=False).count(),
            "total_reviews": review_qs.count(),
            "average_rating": round(float(average_rating), 2)
            if average_rating
            else 0.0,
            "total_favorites": favorites_count,
            "recent_listings": recent_listings,
            "recent_reviews": recent_reviews,
            "activities": activities,
        }
        serializer = AgentDashboardSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def activities(self, request, pk=None):
        vendor = self._get_vendor()
        limit = int(request.query_params.get("limit", 20))
        activities = self._build_activities(vendor, limit=limit)
        serializer = AgentActivitySerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        vendor = self._get_vendor()
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can verify vendors.")
        vendor.verified = True
        vendor.save(update_fields=["verified"])
        serializer = self.get_serializer(vendor)
        return Response(serializer.data, status=status.HTTP_200_OK)
