import { supabase } from '../../Config/supabase';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { CreateChildInput, UpdateChildInput } from './children.schema';

export const childrenService = {
  async getParentId(authUserId: string): Promise<string> {
    const { data, error } = await supabase
      .from('parent_accounts')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !data) {
      throw new AppError(404, 'Parent account not found');
    }

    return data.id;
  },

  async list(authUserId: string) {
    const parentId = await this.getParentId(authUserId);

    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to list children', { message: error.message });
      throw new AppError(500, 'Failed to retrieve children');
    }

    return data;
  },

  async getOne(authUserId: string, childId: string) {
    const parentId = await this.getParentId(authUserId);

    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .eq('parent_id', parentId)
      .single();

    if (error || !data) {
      throw new AppError(404, 'Child not found');
    }

    return data;
  },

  async create(authUserId: string, input: CreateChildInput) {
    const parentId = await this.getParentId(authUserId);

    const { count } = await supabase
      .from('child_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', parentId);

    if ((count ?? 0) >= 5) {
      throw new AppError(400, 'Maximum of 5 child profiles allowed');
    }

    const { data, error } = await supabase
      .from('child_profiles')
      .insert({
        parent_id: parentId,
        display_name: input.display_name,
        avatar_id: input.avatar_id ?? null,
        birth_year: input.birth_year ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to create child', { message: error?.message });
      throw new AppError(500, 'Failed to create child profile');
    }

    logger.info('Child profile created', { parentId });

    return data;
  },

  async update(authUserId: string, childId: string, input: UpdateChildInput) {
    const parentId = await this.getParentId(authUserId);

    const { data, error } = await supabase
      .from('child_profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', childId)
      .eq('parent_id', parentId)
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to update child', { message: error?.message });
      throw new AppError(404, 'Child not found or update failed');
    }

    return data;
  },

  async remove(authUserId: string, childId: string) {
    const parentId = await this.getParentId(authUserId);

    const { error } = await supabase
      .from('child_profiles')
      .delete()
      .eq('id', childId)
      .eq('parent_id', parentId);

    if (error) {
      logger.error('Failed to delete child', { message: error.message });
      throw new AppError(404, 'Child not found or delete failed');
    }

    return { message: 'Child profile deleted' };
  },
};
