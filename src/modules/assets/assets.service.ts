import { env } from '../../Config/env';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

const SUPABASE_STORAGE_URL = `${env.SUPABASE_URL}/storage/v1`;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = env.STORAGE_BUCKET_ACTIVITIES;
const EXPIRY = Number(env.SIGNED_URL_EXPIRY_SECONDS);

export const assetsService = {
  async getSignedUrl(filePath: string): Promise<string> {
    const res = await fetch(
      `${SUPABASE_STORAGE_URL}/object/sign/${BUCKET}/${filePath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: EXPIRY }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      logger.error('Failed to generate signed URL', { filePath, err });
      throw new AppError(500, 'Failed to generate asset URL');
    }

    const data = await res.json();
    // Supabase returns a relative path — build the full URL
    const signedUrl = data.signedURL.startsWith('http')
      ? data.signedURL
      : `${env.SUPABASE_URL}/storage/v1${data.signedURL}`;

    return signedUrl;
  },

  async getSignedUrls(
    filePaths: string[]
  ): Promise<Record<string, string>> {
    const res = await fetch(
      `${SUPABASE_STORAGE_URL}/object/sign/${BUCKET}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paths: filePaths, expiresIn: EXPIRY }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      logger.error('Failed to generate signed URLs', { err });
      throw new AppError(500, 'Failed to generate asset URLs');
    }

    const data: Array<{ path: string; signedURL: string; error: string | null }> =
      await res.json();

    const result: Record<string, string> = {};
    data.forEach((item) => {
      if (item.signedURL && !item.error) {
        const fullUrl = item.signedURL.startsWith('http')
          ? item.signedURL
          : `${env.SUPABASE_URL}/storage/v1${item.signedURL}`;
        result[item.path] = fullUrl;
      }
    });

    return result;
  },
};
