import { supabase } from '../../Config/supabase';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

export const parentsService = {
  async getProfile(authUserId: string) {
    const { data, error } = await supabase
      .from('parent_accounts')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !data) {
      throw new AppError(404, 'Parent profile not found');
    }

    return data;
  },

  async updateProfile(
    authUserId: string,
    input: { display_name?: string; locale?: string; country_code?: string }
  ) {
    const { data, error } = await supabase
      .from('parent_accounts')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_user_id', authUserId)
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to update parent profile', {
        message: error?.message,
      });
      throw new AppError(500, 'Failed to update profile');
    }

    return data;
  },

  async getDashboard(authUserId: string) {
    const { data: parent, error: parentError } = await supabase
      .from('parent_accounts')
      .select('id, display_name, subscription_status')
      .eq('auth_user_id', authUserId)
      .single();

    if (parentError || !parent) {
      throw new AppError(404, 'Parent profile not found');
    }

    const { data: children, error: childrenError } = await supabase
      .from('child_profiles')
      .select('id, display_name, avatar_id, birth_year')
      .eq('parent_id', parent.id);

    if (childrenError) {
      throw new AppError(500, 'Failed to retrieve children');
    }

    const childrenWithStats = await Promise.all(
      (children ?? []).map(async (child) => {
        const { data: sessions } = await supabase
          .from('activity_sessions')
          .select('score, max_score, completion_status, started_at, activity_manifests(title_en, category)')
          .eq('child_id', child.id)
          .eq('completion_status', 'completed')
          .order('started_at', { ascending: false })
          .limit(5);

        const completedSessions = sessions ?? [];
        const totalScore = completedSessions.reduce(
          (sum, s) => sum + (s.score ?? 0),
          0
        );
        const avgScore =
          completedSessions.length > 0
            ? Math.round(totalScore / completedSessions.length)
            : null;

        return {
          ...child,
          stats: {
            total_completed: completedSessions.length,
            average_score: avgScore,
            recent_sessions: completedSessions,
          },
        };
      })
    );

    return {
      parent: {
        display_name: parent.display_name,
        subscription_status: parent.subscription_status,
      },
      children: childrenWithStats,
    };
  },
};
