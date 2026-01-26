import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from rockflint_web.ads.models import Category
from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import ListingImage
from rockflint_web.ads.models import LGA
from rockflint_web.ads.models import Offer
from rockflint_web.ads.models import State
from rockflint_web.users.models import Vendor
from rockflint_web.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def location_data():
    state = State.objects.create(name="Test State")
    lga = LGA.objects.create(state=state, name="Test LGA")
    return state, lga


@pytest.fixture
def listing_dependencies(location_data):
    state, lga = location_data
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


def test_vendor_can_create_listing(api_client, listing_dependencies):
    user = UserFactory()
    create_vendor(user)
    api_client.force_authenticate(user=user)
    category, offer, state, lga = listing_dependencies

    payload = {
        "title": "New Listing",
        "description": "Nice place",
        "price": "1500.00",
        "rent_period": "monthly",
        "bedrooms": 2,
        "bathrooms": 1,
        "area": 900,
        "attributes": {"furnishing": "furnished"},
        "category": category.id,
        "offer": offer.id,
        "state": state.id,
        "lga": lga.id,
    }

    response = api_client.post(reverse("ads:listings-list"), payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["title"] == payload["title"]


def test_non_vendor_cannot_create_listing(api_client, listing_dependencies):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    category, offer, state, lga = listing_dependencies

    payload = {
        "title": "Blocked Listing",
        "price": "900.00",
        "category": category.id,
        "offer": offer.id,
        "state": state.id,
        "lga": lga.id,
    }

    response = api_client.post(reverse("ads:listings-list"), payload, format="json")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_listing_images_scoped_to_vendor(api_client, listing_dependencies):
    user_owner = UserFactory()
    vendor_owner = create_vendor(user_owner)
    listing_owner = create_listing(vendor_owner, listing_dependencies)

    user_other = UserFactory()
    vendor_other = create_vendor(user_other)
    listing_other = create_listing(vendor_other, listing_dependencies, title="Other")

    image = SimpleUploadedFile("photo.jpg", b"filecontent", content_type="image/jpeg")
    ListingImage.objects.create(listing=listing_owner, image=image, is_primary=True)
    ListingImage.objects.create(listing=listing_other, image=image)

    api_client.force_authenticate(user=user_owner)

    response = api_client.get(reverse("ads:listing-images-list"))

    assert response.status_code == status.HTTP_200_OK
    data = response.data.get("results", response.data)
    assert len(data) == 1
