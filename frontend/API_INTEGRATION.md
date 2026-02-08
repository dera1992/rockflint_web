# API Integration

## Base
- Base URL: `NEXT_PUBLIC_API_BASE_URL`
- API root: `/api/`
- OpenAPI schema: `/api/schema/`

## Auth & Users
- `POST /api/users/register/` → create account (email activation required)
- `POST /api/users/login/` → JWT access/refresh
- `POST /api/users/auth/login/` → OTP flow (returns `otp_required`)
- `POST /api/users/auth/verify-otp/` → JWT after OTP
- `POST /api/users/token/refresh/` → refresh access token
- `GET /api/users/me/` → current user profile
- `PUT /api/users/profile/` → update profile
- `POST /api/users/password-reset/` → request reset
- `POST /api/users/password-reset/confirm/` → confirm reset
- `GET /api/users/activate/{uidb64}/{token}/` → activate account
- `PUT /api/users/change-password/` → change password
- `POST /api/users/deactivate/` → deactivate
- `DELETE /api/users/delete/` → delete

## Listings / Ads
- `GET /api/ads/listings/` → list (filters: `min_price`, `max_price`, `category`, `offer`, `state`, `lga`, `bedrooms`, `promoted`, `ordering`, `latitude`, `longitude`, `radius_km`)
- `POST /api/ads/listings/` → create listing
- `GET /api/ads/listings/{id}/` → detail
- `PATCH /api/ads/listings/{id}/` → update
- `DELETE /api/ads/listings/{id}/` → delete
- `POST /api/ads/listings/{id}/toggle_favorite/`
- `GET /api/ads/listings/{id}/reviews/`
- `POST /api/ads/listings/{id}/add_review/`
- `GET /api/ads/listings/{id}/recommendations/`

## Lookup Data
- `GET /api/ads/categories/`
- `GET /api/ads/offers/`
- `GET /api/ads/states/`
- `GET /api/ads/lgas/?state={id}`
- `GET /api/ads/features/`

## Listing Images
- `GET /api/ads/listing-images/`
- `POST /api/ads/listing-images/` (multipart: `listing`, `image`)
- `DELETE /api/ads/listing-images/{id}/`

## Vendors
- `GET /api/agent/public-vendors/`
- `GET /api/agent/public-vendors/{id}/`
- `GET /api/agent/vendors/{id}/dashboard/`
- `GET /api/agent/vendors/{id}/activities/`
- `POST /api/agent/vendors/{id}/verify/`

## Customers
- `GET /api/customer/customers/{id}/`
- `GET /api/customer/customers/wishlist/`

## Placeholder endpoints
These are stubbed in the frontend to align with the design intent. Update when backend endpoints are available:
- `/api/payments/overview/`
- `/api/alerts/`
- `/api/recommendations/`
- `/api/chat/`
