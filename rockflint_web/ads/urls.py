from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from rockflint_web.ads.api.views import ListingImageViewSet
from rockflint_web.ads.api.views import ListingViewSet
app_name = "ads"

router = DefaultRouter()
router.register("listings", ListingViewSet, basename="listings")
router.register("listing-images", ListingImageViewSet, basename="listing-images")

urlpatterns = [
    path("", include(router.urls)),
]
