// ===========================
// Auth
// ===========================

export interface AuthUser {
  id: string;
  email: string;
  role: 'parent';
}

// Extends Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ===========================
// Parent Account
// ===========================

export interface ParentAccount {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string | null;
  country_code: string | null;
  locale: string;
  subscription_status: 'free' | 'trial' | 'active' | 'cancelled' | 'past_due';
  subscription_expires_at: string | null;
  coppa_consent_given: boolean;
  coppa_consent_at: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================
// Child Profile
// ===========================

export interface ChildProfile {
  id: string;
  parent_id: string;
  display_name: string;
  avatar_id: string | null;
  birth_year: number | null;
  created_at: string;
  updated_at: string;
}

// ===========================
// Activity Manifest
// ===========================

export interface ActivityManifest {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string | null;
  title_fr: string | null;
  category: string | null;
  target_age_min: number;
  target_age_max: number;
  sequence_url: string | null;
  thumbnail_url: string | null;
  estimated_duration_seconds: number | null;
  required_plan: 'free' | 'premium';
  is_published: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

// ===========================
// Activity Session
// ===========================

export interface ActivitySession {
  id: string;
  child_id: string;
  activity_id: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  score: number | null;
  max_score: number | null;
  attempts: number;
  completion_status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
}

// ===========================
// API Response helpers
// ===========================

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
