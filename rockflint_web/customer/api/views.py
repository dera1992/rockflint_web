from django.contrib.auth import get_user_model
from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from rockflint_web.ads.models import Favorite
from rockflint_web.users.models import Profile

from .serializers import CustomerSerializer
from .serializers import FavoriteListingSerializer

User = get_user_model()


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    queryset = Profile.objects.select_related("user")
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        if hasattr(self.request.user, "profile"):
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def get_permissions(self):
        if self.action in ["list", "create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    @action(detail=False, methods=["get"])
    def wishlist(self, request):
        if request.user.is_staff and request.query_params.get("user_id"):
            user = User.objects.filter(id=request.query_params["user_id"]).first()
            if user is None:
                return Response([])
        else:
            user = request.user

        favorites = (
            Favorite.objects.filter(user=user)
            .select_related("listing")
            .order_by("-saved_at")
        )
        serializer = FavoriteListingSerializer(favorites, many=True)
        return Response(serializer.data)
