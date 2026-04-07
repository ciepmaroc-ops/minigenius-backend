import { supabase } from '../../Config/supabase';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { RegisterInput, LoginInput, RefreshInput } from './auth.schema';

export const authService = {
  async register(input: RegisterInput) {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      logger.error('Failed to create auth user', { message: authError?.message });
      if (authError?.message.includes('already registered')) {
        throw new AppError(409, 'An account with this email already exists');
      }
      throw new AppError(500, 'Failed to create account');
    }

    const { error: profileError } = await supabase
      .from('parent_accounts')
      .insert({
        auth_user_id: authData.user.id,
        email: input.email,
        display_name: input.display_name,
        locale: input.locale,
        coppa_consent_given: input.coppa_consent,
        coppa_consent_at: new Date().toISOString(),
      });

    if (profileError) {
      logger.error('Failed to create parent profile', { message: profileError.message });
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new AppError(500, 'Failed to create account profile');
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

    if (sessionError || !sessionData.session) {
      throw new AppError(500, 'Account created but login failed');
    }

    logger.info('New parent registered', { email: input.email });

    return {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_in: sessionData.session.expires_in,
      user: {
        id: authData.user.id,
        email: input.email,
        display_name: input.display_name,
      },
    };
  },

  async login(input: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.session) {
      logger.warn('Failed login attempt', { email: input.email });
      throw new AppError(401, 'Invalid email or password');
    }

    const { data: profile } = await supabase
      .from('parent_accounts')
      .select('display_name, subscription_status')
      .eq('auth_user_id', data.user.id)
      .single();

    logger.info('Parent logged in', { email: input.email });

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: profile?.display_name ?? null,
        subscription_status: profile?.subscription_status ?? 'free',
      },
    };
  },

  async refresh(input: RefreshInput) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: input.refresh_token,
    });

    if (error || !data.session) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  },

  async logout(token: string) {
    const { error } = await supabase.auth.admin.signOut(token);
    if (error) {
      logger.warn('Logout error', { message: error.message });
    }
    return { message: 'Logged out successfully' };
  },
};
