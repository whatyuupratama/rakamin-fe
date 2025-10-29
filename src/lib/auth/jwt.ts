import crypto from 'node:crypto';

type BasePayload = Record<string, unknown> & {
  exp?: number;
  iat?: number;
};

const base64UrlEncode = (input: Buffer | string) => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (input: string) => {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  const normalized = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64');
};

const createSignature = (data: string, secret: string) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return base64UrlEncode(hmac.digest());
};

export interface SignJwtOptions {
  expiresInSeconds: number;
}

export const signJwt = <TPayload extends Record<string, unknown>>(
  payload: TPayload,
  secret: string,
  options: SignJwtOptions
): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + options.expiresInSeconds;

  const headerSegment = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadSegment = base64UrlEncode(
    JSON.stringify({
      ...payload,
      iat: issuedAt,
      exp: expiresAt,
    })
  );

  const toSign = `${headerSegment}.${payloadSegment}`;
  const signatureSegment = createSignature(toSign, secret);
  return `${headerSegment}.${payloadSegment}.${signatureSegment}`;
};

export interface VerifyJwtResult<TPayload extends BasePayload> {
  valid: boolean;
  expired: boolean;
  payload: TPayload | null;
}

export const verifyJwt = <TPayload extends BasePayload>(
  token: string,
  secret: string
): VerifyJwtResult<TPayload> => {
  if (!token) {
    return { valid: false, expired: false, payload: null };
  }

  const [headerSegment, payloadSegment, signatureSegment] = token.split('.');
  if (!headerSegment || !payloadSegment || !signatureSegment) {
    return { valid: false, expired: false, payload: null };
  }

  const expectedSignature = createSignature(`${headerSegment}.${payloadSegment}`, secret);
  const actualSignature = signatureSegment;

  const expectedBuffer = base64UrlDecode(expectedSignature);
  const actualBuffer = base64UrlDecode(actualSignature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return { valid: false, expired: false, payload: null };
  }

  try {
    const payloadJson = base64UrlDecode(payloadSegment).toString('utf-8');
    const payload = JSON.parse(payloadJson) as TPayload;

    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, expired: true, payload: null };
    }

    return { valid: true, expired: false, payload };
  } catch {
    return { valid: false, expired: false, payload: null };
  }
};
