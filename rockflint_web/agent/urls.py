from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from rockflint_web.agent.api.views import VendorViewSet

app_name = "agent"

router = DefaultRouter()
router.register("vendors", VendorViewSet, basename="vendors")

urlpatterns = [
    path("", include(router.urls)),
]
