export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  businessId: string;
}

export interface AuthBusiness {
  id: string;
  name: string;
  onboarding_status?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    business_id: string;
  };
  business: {
    id: string;
    name: string;
    onboarding_status?: string;
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  business_name: string;
  city: string;
  phone?: string;
  country_code?: string;
  is_whatsapp?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}
