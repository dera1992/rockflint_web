from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from rockflint_web.ads.api.views import CategoryViewSet
from rockflint_web.ads.api.views import FeatureViewSet
from rockflint_web.ads.api.views import LGAViewSet
from rockflint_web.ads.api.views import ListingImageViewSet
from rockflint_web.ads.api.views import ListingViewSet
from rockflint_web.ads.api.views import OfferViewSet
from rockflint_web.ads.api.views import StateViewSet
app_name = "ads"

router = DefaultRouter()
router.register("listings", ListingViewSet, basename="listings")
router.register("listing-images", ListingImageViewSet, basename="listing-images")
router.register("categories", CategoryViewSet, basename="categories")
router.register("offers", OfferViewSet, basename="offers")
router.register("states", StateViewSet, basename="states")
router.register("lgas", LGAViewSet, basename="lgas")
router.register("features", FeatureViewSet, basename="features")

urlpatterns = [
    path("", include(router.urls)),
]
