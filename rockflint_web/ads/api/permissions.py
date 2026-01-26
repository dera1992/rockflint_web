from rest_framework import permissions


class IsVendorOwnerOrReadOnly(permissions.BasePermission):
    """
    Read-only for everyone, write only for listing.vendor.user
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # obj is Listing
        return (
            request.user.is_authenticated
            and hasattr(obj, "vendor")
            and obj.vendor.user_id == request.user.id
        )
