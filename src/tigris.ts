import {
  createBucket,
  createBucketSnapshot,
  get,
  head,
  list,
  put,
  remove,
  removeBucket,
  type BucketLocations,
} from '@tigrisdata/storage';

import { LOCATION, type AuthConfig } from './types.js';

type BucketConfig = AuthConfig & { bucket: string };

export function withBucket(auth: AuthConfig, bucket: string): BucketConfig {
  return {
    ...auth,
    bucket,
  };
}

export async function createBucketOrThrow(
  bucket: string,
  auth: AuthConfig,
  options?: {
    enableSnapshot?: boolean;
    sourceBucketName?: string;
    sourceBucketSnapshot?: string;
    locations?: BucketLocations;
  },
): Promise<void> {
  const result = await createBucket(bucket, {
    ...options,
    locations: options?.locations ?? LOCATION,
    config: auth,
  });

  if (result.error) {
    throw new Error(`Failed to create bucket ${bucket}: ${result.error.message}`);
  }
}

export async function createForkBucketOrThrow(
  bucket: string,
  parentBucket: string,
  parentSnapshotVersion: string,
  auth: AuthConfig,
): Promise<boolean> {
  const preferred = await createBucket(bucket, {
    enableSnapshot: true,
    sourceBucketName: parentBucket,
    sourceBucketSnapshot: parentSnapshotVersion,
    locations: LOCATION,
    config: auth,
  });

  if (!preferred.error) {
    return true;
  }

  const fallback = await createBucket(bucket, {
    sourceBucketName: parentBucket,
    sourceBucketSnapshot: parentSnapshotVersion,
    locations: LOCATION,
    config: auth,
  });

  if (fallback.error) {
    throw new Error(
      `Failed to create fork bucket ${bucket} from ${parentBucket}@${parentSnapshotVersion}: ${preferred.error.message}; fallback without enableSnapshot also failed: ${fallback.error.message}`,
    );
  }

  return false;
}

export async function createSnapshotOrThrow(bucket: string, auth: AuthConfig, name: string): Promise<string> {
  const result = await createBucketSnapshot(bucket, {
    name,
    config: auth,
  });

  if (result.error || !result.data?.snapshotVersion) {
    throw new Error(`Failed to create snapshot for ${bucket}: ${result.error?.message ?? 'missing snapshot version'}`);
  }

  return result.data.snapshotVersion;
}

export async function putObjectOrThrow(bucket: string, key: string, body: Buffer, auth: AuthConfig, allowOverwrite = true): Promise<void> {
  const result = await put(key, body, {
    allowOverwrite,
    contentType: 'application/octet-stream',
    config: withBucket(auth, bucket),
  });

  if (result.error) {
    throw new Error(`PUT failed for ${bucket}/${key}: ${result.error.message}`);
  }
}

export async function getObjectOrThrow(bucket: string, key: string, auth: AuthConfig): Promise<void> {
  const result = await get(key, 'string', {
    config: withBucket(auth, bucket),
  });

  if (result.error) {
    throw new Error(`GET failed for ${bucket}/${key}: ${result.error.message}`);
  }
}

export async function headObjectOrThrow(bucket: string, key: string, auth: AuthConfig): Promise<void> {
  const result = await head(key, {
    config: withBucket(auth, bucket),
  });

  if (result.error) {
    throw new Error(`HEAD failed for ${bucket}/${key}: ${result.error.message}`);
  }
}

export async function listPrefixOrThrow(bucket: string, prefix: string, auth: AuthConfig): Promise<void> {
  const result = await list({
    prefix,
    config: withBucket(auth, bucket),
  });

  if (result.error) {
    throw new Error(`LIST failed for ${bucket}/${prefix}: ${result.error.message}`);
  }
}

export async function removeObjectOrThrow(bucket: string, key: string, auth: AuthConfig): Promise<void> {
  const result = await remove(key, {
    config: withBucket(auth, bucket),
  });

  if (result.error) {
    throw new Error(`DELETE failed for ${bucket}/${key}: ${result.error.message}`);
  }
}

export async function removeBucketOrThrow(bucket: string, auth: AuthConfig): Promise<void> {
  const result = await removeBucket(bucket, {
    force: true,
    config: auth,
  });

  if (result.error) {
    throw new Error(`Failed to remove bucket ${bucket}: ${result.error.message}`);
  }
}
