import { supabase } from '../../config/supabase';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import {
  StartSessionInput,
  UpdateSessionInput,
  CompleteSessionInput,
} from './sessions.schema';

export const sessionsService = {
  async verifyChildOwnership(
    authUserId: string,
    childId: string
  ): Promise<void> {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('id, parent_accounts!inner(auth_user_id)')
      .eq('id', childId)
      .single();

    if (error || !data) {
      throw new AppError(404, 'Child not found');
    }

    const parent = data.parent_accounts as unknown as {
      auth_user_id: string;
    };

    if (parent.auth_user_id !== authUserId) {
      throw new AppError(403, 'Access denied');
    }
  },

  async start(authUserId: string, input: StartSessionInput) {
    await this.verifyChildOwnership(authUserId, input.child_id);

    const { data, error } = await supabase
      .from('activity_sessions')
      .insert({
        child_id: input.child_id,
        activity_id: input.activity_id,
        completion_status: 'in_progress',
      })
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to start session', { message: error?.message });
      throw new AppError(500, 'Failed to start activity session');
    }

    logger.info('Session started', {
      childId: input.child_id,
      activityId: input.activity_id,
    });

    return data;
  },

  async update(
    authUserId: string,
    sessionId: string,
    input: UpdateSessionInput
  ) {
    const { data: session, error: fetchError } = await supabase
      .from('activity_sessions')
      .select('child_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      throw new AppError(404, 'Session not found');
    }

    await this.verifyChildOwnership(authUserId, session.child_id);

    const { data, error } = await supabase
      .from('activity_sessions')
      .update(input)
      .eq('id', sessionId)
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to update session', { message: error?.message });
      throw new AppError(500, 'Failed to update session');
    }

    return data;
  },

  async complete(
    authUserId: string,
    sessionId: string,
    input: CompleteSessionInput
  ) {
    const { data: session, error: fetchError } = await supabase
      .from('activity_sessions')
      .select('child_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      throw new AppError(404, 'Session not found');
    }

    await this.verifyChildOwnership(authUserId, session.child_id);

    const { data, error } = await supabase
      .from('activity_sessions')
      .update({
        score: input.score,
        max_score: input.max_score,
        duration_seconds: input.duration_seconds,
        completion_status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to complete session', { message: error?.message });
      throw new AppError(500, 'Failed to complete session');
    }

    logger.info('Session completed', {
      sessionId,
      score: input.score,
      maxScore: input.max_score,
    });

    return data;
  },

  async listByChild(authUserId: string, childId: string) {
    await this.verifyChildOwnership(authUserId, childId);

    const { data, error } = await supabase
      .from('activity_sessions')
      .select('*, activity_manifests(slug, title_en, category)')
      .eq('child_id', childId)
      .order('started_at', { ascending: false });

    if (error) {
      logger.error('Failed to list sessions', { message: error.message });
      throw new AppError(500, 'Failed to retrieve sessions');
    }

    return data;
  },
};