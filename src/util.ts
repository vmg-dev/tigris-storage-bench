import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

export function sanitizeBucketPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function makeBucketName(prefix: string, suffix: string): string {
  const normalizedPrefix = sanitizeBucketPart(prefix);
  const normalizedSuffix = sanitizeBucketPart(suffix);
  const unique = randomUUID().slice(0, 8);
  const raw = `${normalizedPrefix}-${normalizedSuffix}-${unique}`;
  return raw.slice(0, 63).replace(/-$/, 'a');
}

export function makeRunId(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${sanitizeBucketPart(prefix)}-${timestamp}-${randomUUID().slice(0, 8)}`;
}

export function createPayload(sizeBytes: number, seed: string): Buffer {
  const chunk = Buffer.from(`${seed}|`);
  const payload = Buffer.alloc(sizeBytes);
  for (let offset = 0; offset < sizeBytes; offset += chunk.length) {
    chunk.copy(payload, offset, 0, Math.min(chunk.length, sizeBytes - offset));
  }
  return payload;
}

export function percentile(sorted: number[], ratio: number): number {
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index] ?? 0;
}

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function writeText(path: string, value: string): Promise<void> {
  await writeFile(path, value, 'utf8');
}

export function resolveArtifactDir(root: string, runId: string): string {
  return resolve(root, runId);
}
