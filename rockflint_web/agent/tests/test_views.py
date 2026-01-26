import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from rockflint_web.ads.models import Category
from rockflint_web.ads.models import Favorite
from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import LGA
from rockflint_web.ads.models import Offer
from rockflint_web.ads.models import Review
from rockflint_web.ads.models import State
from rockflint_web.users.models import Vendor
from rockflint_web.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def listing_dependencies():
    state = State.objects.create(name="Test State")
    lga = LGA.objects.create(state=state, name="Test LGA")
    category = Category.objects.create(name="Apartment")
    offer = Offer.objects.create(name="For Rent")
    return category, offer, state, lga


def create_vendor(user):
    return Vendor.objects.create(user=user, company_name="Test Co")


def create_listing(vendor, listing_dependencies, title="Test Listing", active=True):
    category, offer, state, lga = listing_dependencies
    return Listing.objects.create(
        vendor=vendor,
        title=title,
        category=category,
        offer=offer,
        state=state,
        lga=lga,
        price=1200,
        active=active,
    )


def test_vendor_dashboard_shows_activity_counts(api_client, listing_dependencies):
    vendor_user = UserFactory()
    vendor = create_vendor(vendor_user)
    listing_active = create_listing(vendor, listing_dependencies, title="Active")
    create_listing(vendor, listing_dependencies, title="Inactive", active=False)

    reviewer = UserFactory()
    Review.objects.create(
        user=reviewer,
        listing=listing_active,
        rating=4,
        title="Solid",
        comment="Good experience.",
    )
    Favorite.objects.create(user=reviewer, listing=listing_active)

    api_client.force_authenticate(user=vendor_user)
    response = api_client.get(
        reverse("agent:vendors-dashboard", args=[vendor.id]),
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["total_listings"] == 2
    assert response.data["active_listings"] == 1
    assert response.data["inactive_listings"] == 1
    assert response.data["total_reviews"] == 1
    assert response.data["total_favorites"] == 1
    assert response.data["average_rating"] == 4.0


def test_staff_can_verify_vendor(api_client):
    staff_user = UserFactory(is_staff=True)
    vendor_user = UserFactory()
    vendor = create_vendor(vendor_user)

    api_client.force_authenticate(user=staff_user)
    response = api_client.post(reverse("agent:vendors-verify", args=[vendor.id]))

    assert response.status_code == status.HTTP_200_OK
    vendor.refresh_from_db()
    assert vendor.verified is True


def test_non_staff_cannot_list_vendors(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)

    response = api_client.get(reverse("agent:vendors-list"))

    assert response.status_code == status.HTTP_403_FORBIDDEN
