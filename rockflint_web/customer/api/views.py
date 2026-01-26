from rest_framework import permissions
from rest_framework import viewsets

from rockflint_web.users.models import Profile

from .serializers import CustomerSerializer


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
