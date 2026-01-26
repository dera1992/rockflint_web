from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from rockflint_web.customer.api.views import CustomerViewSet

app_name = "customer"

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customers")

urlpatterns = [
    path("", include(router.urls)),
]
