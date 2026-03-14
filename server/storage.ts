import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

type StorageConfig = { baseUrl: string; apiKey: string };

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toContentBody(data: Buffer | Uint8Array | string) {
  if (typeof data === "string") {
    return Buffer.from(data);
  }
  return Buffer.from(data);
}

function hasR2Config() {
  return Boolean(
    ENV.r2AccessKeyId &&
      ENV.r2SecretAccessKey &&
      ENV.r2Bucket &&
      (ENV.r2Endpoint || ENV.r2AccountId)
  );
}

function getR2Client() {
  const endpoint =
    ENV.r2Endpoint ||
    `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: ENV.r2AccessKeyId,
      secretAccessKey: ENV.r2SecretAccessKey,
    },
  });
}

function getPublicR2Url(key: string) {
  if (!ENV.r2PublicUrl) {
    return null;
  }

  return new URL(normalizeKey(key), ensureTrailingSlash(ENV.r2PublicUrl)).toString();
}

async function storagePutR2(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.r2Bucket,
      Key: key,
      Body: toContentBody(data),
      ContentType: contentType,
    })
  );

  const publicUrl = getPublicR2Url(key);
  if (publicUrl) {
    return { key, url: publicUrl };
  }

  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: ENV.r2Bucket,
      Key: key,
    }),
    { expiresIn: 60 * 60 * 24 * 7 }
  );

  return { key, url: signedUrl };
}

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage credentials missing: configure Cloudflare R2 or set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

async function storagePutForge(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (hasR2Config()) {
    return storagePutR2(relKey, data, contentType);
  }

  return storagePutForge(relKey, data, contentType);
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (hasR2Config()) {
    const publicUrl = getPublicR2Url(key);
    if (!publicUrl) {
      throw new Error("R2_PUBLIC_URL is required to read files from Cloudflare R2");
    }
    return { key, url: publicUrl };
  }

  const { baseUrl, apiKey } = getStorageConfig();
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
