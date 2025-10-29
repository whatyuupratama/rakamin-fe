import nodemailer, { type SentMessageInfo } from 'nodemailer';
import type { MagicLinkPurpose } from './types';

export interface MagicLinkEmailPayload {
  email: string;
  magicLinkUrl: string;
  expiresAt: Date;
  purpose: MagicLinkPurpose;
}

const getSubject = (purpose: MagicLinkPurpose) => {
  if (purpose === 'register') return 'Lengkapi pendaftaran Rakamin kamu';
  return 'Link masuk ke akun Rakamin kamu';
};

const formatExpireDuration = (expiresAt: Date) => {
  const diffMs = expiresAt.getTime() - Date.now();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  return `${minutes} menit`;
};

export const renderMagicLinkEmail = ({
  email,
  magicLinkUrl,
  expiresAt,
  purpose,
}: MagicLinkEmailPayload) => {
  const subject = getSubject(purpose);
  const expireDuration = formatExpireDuration(expiresAt);

  const html = `<!DOCTYPE html>
  <html lang="id">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${subject}</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; padding: 32px; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(1, 149, 159, 0.08); }
        .header { background: #111827; padding: 32px; text-align: center; }
        .header img { width: 120px; }
        .content { padding: 36px 40px; color: #111827; }
        h1 { font-size: 28px; margin: 0 0 24px; color: #0f172a; }
        p { line-height: 1.6; margin: 12px 0; color: #4b5563; }
        .button { display: inline-block; margin: 32px 0; padding: 14px 28px; border-radius: 12px; background: #01959f; color: #ffffff; text-decoration: none; font-weight: 600; box-shadow: 0 10px 20px rgba(1, 149, 159, 0.25); }
        .footer { padding: 24px 40px 40px; background: #f9fafb; font-size: 12px; color: #6b7280; }
        .link { color: #01959f; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="https://rakamin.com/_nuxt/img/logo-rakamin.373acae.svg" alt="Rakamin" />
        </div>
        <div class="content">
          <h1>Masuk ke Rakamin</h1>
          <p>Hai ${email},</p>
          <p>Berikut adalah link ${
            purpose === 'register' ? 'pendaftaran' : 'masuk'
          } yang kamu minta. Klik tombol di bawah untuk melanjutkan ke Rakamin.</p>
          <p style="color:#ef4444; font-weight:500; margin-top: 24px;">Link ini hanya bisa dipakai selama ${expireDuration}.</p>
          <a class="button" href="${magicLinkUrl}">Masuk ke Rakamin</a>
          <p>Jika tombol di atas tidak bekerja, salin dan tempel URL berikut di browser kamu:</p>
          <p class="link">${magicLinkUrl}</p>
          <p>Kalau kamu tidak merasa meminta link ini, abaikan saja email ini.</p>
        </div>
        <div class="footer">
          PT. Rakamin Kolektif Madani<br />
          Menara Caraka - Jl. Mega Kuningan Barat, Kuningan, Kec. Setiabudi, Jakarta Selatan, DKI Jakarta 12950<br />
          © ${new Date().getFullYear()} Rakamin. All rights reserved.
        </div>
      </div>
    </body>
  </html>`;

  const text = [
    `Hai ${email},`,
    '',
    'Berikut adalah link yang kamu minta untuk masuk ke Rakamin.',
    magicLinkUrl,
    '',
    `Link berlaku sampai ${expiresAt.toLocaleString('id-ID')}.`,
    'Kalau kamu tidak merasa meminta link ini, abaikan saja email ini.',
  ].join('\n');

  return {
    subject,
    html,
    text,
  };
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn(
      'SMTP env not fully set, falling back to jsonTransport preview.'
    );
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendMagicLinkEmail = async (payload: MagicLinkEmailPayload) => {
  const transporter = createTransporter();

  const message = renderMagicLinkEmail(payload);

  const info = (await transporter.sendMail({
    to: payload.email,
    from: 'Rakamin <no-reply@rakamin.com>',
    subject: message.subject,
    html: message.html,
    text: message.text,
  })) as SentMessageInfo & { message?: unknown };

  const json = typeof info.message === 'string' ? info.message : '';

  return {
    messageId: info.messageId,
    envelope: info.envelope,
    jsonPreview: json,
  };
};
