# ads/serializers.py
from django.contrib.gis.geos import Point
from rest_framework import serializers

from rockflint_web.ads.models import Category
from rockflint_web.ads.models import Feature
from rockflint_web.ads.models import LGA
from rockflint_web.ads.models import Offer
from rockflint_web.ads.models import State
from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import ListingImage
from rockflint_web.ads.models import Review


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ("id", "image", "caption", "is_primary", "order")


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ("id", "name", "icon")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ("id", "name", "slug")


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ("id", "name")


class LGASerializer(serializers.ModelSerializer):
    state = StateSerializer(read_only=True)

    class Meta:
        model = LGA
        fields = ("id", "name", "state")


class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    features = FeatureSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "rent_period",
            "bedrooms",
            "bathrooms",
            "area",
            "attributes",
            "features",
            "images",
            "primary_image",
            "category",
            "offer",
            "state",
            "lga",
            "vendor",
            "latitude",
            "longitude",
        ]
        read_only_fields = ("vendor",)

    def get_primary_image(self, obj):
        return obj.primary_image

    def get_latitude(self, obj):
        if obj.location:
            return obj.location.y
        return None

    def get_longitude(self, obj):
        if obj.location:
            return obj.location.x
        return None


class ListingWriteSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "rent_period",
            "bedrooms",
            "bathrooms",
            "area",
            "attributes",
            "features",
            "category",
            "offer",
            "state",
            "lga",
            "address",
            "latitude",
            "longitude",
        ]

    def validate(self, attrs):
        latitude = attrs.get("latitude")
        longitude = attrs.get("longitude")
        if (latitude is None) ^ (longitude is None):
            raise serializers.ValidationError(
                "Both latitude and longitude are required to set location.",
            )
        return attrs

    def _update_location(self, attrs):
        latitude_provided = "latitude" in attrs
        longitude_provided = "longitude" in attrs
        latitude = attrs.pop("latitude", None)
        longitude = attrs.pop("longitude", None)
        if latitude is not None and longitude is not None:
            attrs["location"] = Point(longitude, latitude, srid=4326)
        elif latitude_provided and longitude_provided:
            attrs["location"] = None
        return attrs

    def create(self, validated_data):
        validated_data = self._update_location(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._update_location(validated_data)
        return super().update(instance, validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ("id", "user", "listing", "title", "comment", "rating", "created")
        read_only_fields = ("user", "created")
