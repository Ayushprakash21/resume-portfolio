/**
 * Server-Side Contact Enquiry Email Delivery & Abuse Protection
 * Dispatches verified portfolio inquiries to ayushprakash0021@gmail.com
 * using Resend transactional email API on Cloudflare Workers edge runtime.
 */

export interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

export const DEFAULT_ADMIN_RECIPIENT = 'ayushprakash0021@gmail.com';
export const DEFAULT_SENDER_IDENTITY = 'Ayush Prakash Portfolio <onboarding@resend.dev>';
export const MAX_BODY_BYTES = 50 * 1024; // 50 KB max JSON payload
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const RATE_LIMIT_MAX_REQUESTS = 5; // 5 inquiries per 10 minutes per IP

// Sliding window in-memory rate limiting map for edge isolate
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);

  // Clean stale entries if map grows large
  if (ipRateLimitMap.size > 1000) {
    for (const [key, val] of ipRateLimitMap.entries()) {
      if (val.resetAt < now) {
        ipRateLimitMap.delete(key);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface ContactPayload {
  name: string;
  email: string;
  organization?: string;
  subject?: string;
  message: string;
  hp_website?: string; // Honeypot field
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    name: string;
    email: string;
    organization: string;
    subject: string;
    message: string;
  };
}

export function validateContactPayload(body: any): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Malformed request body. JSON object expected.' };
  }

  // Honeypot check: reject bot submissions silently or with bad request
  if (body.hp_website || body.honeypot || body.website) {
    return { valid: false, error: 'Spam filter triggered.' };
  }

  const rawName = typeof body.name === 'string' ? body.name.trim() : '';
  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const rawOrg = typeof body.organization === 'string' ? body.organization.trim() : '';
  const rawSubject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const rawMsg = typeof body.message === 'string' ? body.message.trim() : '';

  if (!rawName || rawName.length < 2) {
    return { valid: false, error: 'Name is required (at least 2 characters).' };
  }
  if (rawName.length > 100) {
    return { valid: false, error: 'Name exceeds maximum length of 100 characters.' };
  }

  if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
    return { valid: false, error: 'A valid email address is required.' };
  }
  if (rawEmail.length > 254) {
    return { valid: false, error: 'Email exceeds maximum length of 254 characters.' };
  }

  if (!rawMsg || rawMsg.length < 10) {
    return { valid: false, error: 'Message is required (at least 10 characters).' };
  }
  if (rawMsg.length > 5000) {
    return { valid: false, error: 'Message exceeds maximum length of 5000 characters.' };
  }

  if (rawOrg.length > 150) {
    return { valid: false, error: 'Organization exceeds maximum length of 150 characters.' };
  }

  const subject = rawSubject.length > 0 && rawSubject.length <= 200
    ? rawSubject
    : 'Operations & Strategy Inquiry';

  return {
    valid: true,
    sanitized: {
      name: rawName,
      email: rawEmail,
      organization: rawOrg,
      subject,
      message: rawMsg,
    },
  };
}

export function buildPlainEmail(data: {
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
  timestamp: string;
}): string {
  return `NEW PORTFOLIO ENQUIRY — AYUSH PRAKASH
============================================================

Sender Details:
------------------------------------------------------------
Name:         ${data.name}
Email:        ${data.email}
Organization: ${data.organization || 'Not provided'}
Subject:      ${data.subject}
Received:     ${data.timestamp}
Source:       Ayush Prakash Portfolio (resume-portfolio.ayushprakash0021.workers.dev)

Enquiry Message:
------------------------------------------------------------
${data.message}

============================================================
Direct Reply:
Simply reply directly to this email to respond to ${data.email}.
Reply-To has been set to the visitor's verified email address.
`;
}

export function buildHtmlEmail(data: {
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
  timestamp: string;
}): string {
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeOrg = data.organization ? escapeHtml(data.organization) : '';
  const safeSubject = escapeHtml(data.subject);
  const safeMsg = escapeHtml(data.message).replace(/\n/g, '<br/>');
  const safeTimestamp = escapeHtml(data.timestamp);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Portfolio Enquiry — ${safeName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E4E4E7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050507; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0C0D12; border: 1px solid #23080D; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.85);" cellspacing="0" cellpadding="0">
          
          <!-- Top Crimson Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #9E1B2D 0%, #E52E42 50%, #9E1B2D 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1A1B22;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #E52E42; background-color: rgba(229, 46, 66, 0.12); border: 1px solid rgba(229, 46, 66, 0.3); padding: 4px 10px; border-radius: 4px;">
                      PORTFOLIO INQUIRY DISPATCH
                    </span>
                    <h1 style="margin: 14px 0 4px 0; font-size: 22px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.02em;">
                      ${safeSubject}
                    </h1>
                    <div style="font-size: 13px; color: #9CA3AF;">
                      Dispatched from Ayush Prakash Portfolio
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Metadata Table -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0E0F14;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.6;">
                <tr>
                  <td width="130" style="color: #71717A; font-weight: 500; padding: 4px 0;">Visitor Name:</td>
                  <td style="color: #FFFFFF; font-weight: 600; padding: 4px 0;">${safeName}</td>
                </tr>
                <tr>
                  <td width="130" style="color: #71717A; font-weight: 500; padding: 4px 0;">Email Address:</td>
                  <td style="color: #E4E4E7; padding: 4px 0;">
                    <a href="mailto:${safeEmail}" style="color: #E52E42; text-decoration: none;">${safeEmail}</a>
                  </td>
                </tr>
                ${safeOrg ? `
                <tr>
                  <td width="130" style="color: #71717A; font-weight: 500; padding: 4px 0;">Organization:</td>
                  <td style="color: #E4E4E7; padding: 4px 0;">${safeOrg}</td>
                </tr>
                ` : ''}
                <tr>
                  <td width="130" style="color: #71717A; font-weight: 500; padding: 4px 0;">Timestamp:</td>
                  <td style="color: #9CA3AF; padding: 4px 0;">${safeTimestamp}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 28px 32px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717A; font-weight: 600; margin-bottom: 12px;">
                Message Content
              </div>
              <div style="background-color: #14151C; border: 1px solid #1E202B; border-radius: 8px; padding: 20px; font-size: 14.5px; line-height: 1.7; color: #F4F4F5; word-break: break-word;">
                ${safeMsg}
              </div>

              <!-- Quick Reply Action Button -->
              <div style="margin-top: 28px; text-align: left;">
                <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(data.subject)}" style="display: inline-block; background: linear-gradient(135deg, #9E1B2D 0%, #680E1A 100%); color: #FFFFFF; text-decoration: none; font-size: 13.5px; font-weight: 600; padding: 12px 24px; border-radius: 6px; box-shadow: 0 4px 14px rgba(158, 27, 45, 0.4);">
                  Reply to ${safeName} &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #07080A; border-top: 1px solid #16171E; font-size: 11.5px; color: #52525B; line-height: 1.5;">
              This notification was generated automatically by the portfolio enquiry router at <code style="color: #71717A;">resume-portfolio.ayushprakash0021.workers.dev</code>.<br/>
              Delivered directly to administrative destination: <strong style="color: #A1A1AA;">${DEFAULT_ADMIN_RECIPIENT}</strong>.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Handle incoming Contact API request: POST /api/contact/submit
 */
export async function handleContactRequest(
  request: Request,
  env: ContactEnv
): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname !== '/api/contact/submit') {
    return null;
  }

  const origin = request.headers.get('Origin') || '*';
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method Not Allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // 1. IP Rate Limiting
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'anonymous-client';

  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many enquiries submitted from your IP address. Please wait a few minutes before trying again.',
        code: 'RATE_LIMIT_EXCEEDED',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // 2. Request Size Validation
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Payload size exceeds the allowed limit.',
        code: 'PAYLOAD_TOO_LARGE',
      }),
      { status: 413, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // 3. Parse & Validate Payload
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid JSON payload.',
        code: 'INVALID_JSON',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const validation = validateContactPayload(body);
  if (!validation.valid || !validation.sanitized) {
    return new Response(
      JSON.stringify({
        success: false,
        error: validation.error || 'Validation failed.',
        code: 'VALIDATION_FAILED',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const { name, email, organization, subject, message } = validation.sanitized;
  const timestamp = new Date().toISOString();

  // 4. Destination recipient — visitor CANNOT override this
  const toRecipient = env.CONTACT_TO_EMAIL || DEFAULT_ADMIN_RECIPIENT;
  const fromSender = env.CONTACT_FROM_EMAIL || DEFAULT_SENDER_IDENTITY;

  // 5. Verify Resend API Key is configured
  if (!env.RESEND_API_KEY) {
    console.warn('[Contact Email] RESEND_API_KEY is not configured on Cloudflare Worker.');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Email delivery backend credentials are not yet configured on this server.',
        code: 'MISSING_EMAIL_CREDENTIALS',
        recipientConfigured: toRecipient,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // 6. Build Content
  const subjectLine = `New Portfolio Enquiry — ${name}`;
  const plainText = buildPlainEmail({
    name,
    email,
    organization,
    subject,
    message,
    timestamp,
  });
  const htmlContent = buildHtmlEmail({
    name,
    email,
    organization,
    subject,
    message,
    timestamp,
  });

  // 7. Dispatch via Resend API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromSender,
        to: [toRecipient],
        reply_to: email, // Validated visitor email address
        subject: subjectLine,
        text: plainText,
        html: htmlContent,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resendResponse.ok) {
      let resendErr: any = null;
      try {
        resendErr = await resendResponse.json();
      } catch {
        resendErr = { message: await resendResponse.text() };
      }

      console.error('[Contact Email] Resend delivery rejected:', resendResponse.status, resendErr);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email provider rejected the enquiry dispatch.',
          code: 'PROVIDER_REJECTION',
          details: resendErr?.message || 'External provider dispatch failed.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const resendData = (await resendResponse.json()) as { id?: string };

    return new Response(
      JSON.stringify({
        success: true,
        messageId: resendData?.id || 'resend-' + Date.now(),
        deliveredTo: toRecipient,
        timestamp,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (dispatchErr: any) {
    const isTimeout = dispatchErr.name === 'AbortError';
    console.error('[Contact Email] Delivery exception:', dispatchErr);

    return new Response(
      JSON.stringify({
        success: false,
        error: isTimeout
          ? 'Email dispatch timed out while connecting to the email service.'
          : 'An unexpected error occurred during email transmission.',
        code: isTimeout ? 'DISPATCH_TIMEOUT' : 'DISPATCH_ERROR',
      }),
      { status: 504, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
