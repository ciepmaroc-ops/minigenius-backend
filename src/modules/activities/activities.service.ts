import { supabase } from '../../Config/supabase';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { ListActivitiesInput } from './activities.schema';

export const activitiesService = {
  async list(input: ListActivitiesInput) {
    let query = supabase
      .from('activity_manifests')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: true })
      .range(
        Number(input.offset),
        Number(input.offset) + Number(input.limit) - 1
      );

    if (input.category) {
      query = query.eq('category', input.category);
    }

    if (input.required_plan) {
      query = query.eq('required_plan', input.required_plan);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to list activities', { message: error.message });
      throw new AppError(500, 'Failed to retrieve activities');
    }

    return data;
  },

  async getOne(slug: string) {
    const { data, error } = await supabase
      .from('activity_manifests')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      throw new AppError(404, 'Activity not found');
    }

    return data;
  },

  async getByPlan(plan: 'free' | 'premium') {
    const { data, error } = await supabase
      .from('activity_manifests')
      .select('*')
      .eq('is_published', true)
      .eq('required_plan', plan)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to get activities by plan', { message: error.message });
      throw new AppError(500, 'Failed to retrieve activities');
    }

    return data;
  },
};
