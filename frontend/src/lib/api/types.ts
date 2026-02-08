export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListingImage {
  id: number;
  image: string;
  caption?: string;
  is_primary?: boolean;
  order?: number;
}

export interface Feature {
  id: number;
  name: string;
  icon?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Offer {
  id: number;
  name: string;
  slug: string;
}

export interface State {
  id: number;
  name: string;
}

export interface LGA {
  id: number;
  name: string;
  state: State;
}

export interface Listing {
  id: number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  rent_period?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  attributes?: Record<string, unknown> | null;
  features: Feature[];
  images: ListingImage[];
  primary_image?: string | null;
  category?: Category | null;
  offer?: number | null;
  state?: number | null;
  lga?: number | null;
  vendor?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

export interface Review {
  id: number;
  user: string;
  listing: number;
  title: string;
  comment: string;
  rating: number;
  created: string;
}

export interface VendorSummary {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  company_name?: string | null;
  phone_number?: string | null;
  website?: string | null;
  verified?: boolean;
  created?: string;
}

export interface Vendor extends VendorSummary {
  user?: number;
}

export interface VendorDashboard {
  vendor: VendorSummary;
  total_listings: number;
  active_listings: number;
  inactive_listings: number;
  total_reviews: number;
  average_rating: number;
  total_favorites: number;
  recent_listings: Array<{
    id: number;
    title: string;
    slug: string;
    price: number;
    active: boolean;
    created: string;
  }>;
  recent_reviews: Array<{
    id: number;
    user: string;
    listing: number;
    listing_title: string;
    rating: number;
    title: string;
    comment: string;
    created: string;
  }>;
  activities: Array<{
    activity_type: string;
    created: string;
    summary: string;
    listing_id?: number | null;
    listing_title?: string | null;
    actor?: string | null;
  }>;
}

export interface UserProfile {
  username?: string;
  email?: string;
}

export interface ProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_image?: string;
}

export interface CustomerProfile {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  profile_image?: string | null;
}

export interface FavoriteListing {
  listing: {
    id: number;
    title: string;
    slug: string;
    price: number;
    active: boolean;
    created: string;
  };
  saved_at: string;
}
