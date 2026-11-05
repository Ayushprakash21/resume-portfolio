import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Contact Enquiry Email Delivery & Security Suite', async () => {
  const contactHandlerModule = await import('../src/worker/contact/contactHandler.ts');
  const {
    validateContactPayload,
    escapeHtml,
    buildPlainEmail,
    buildHtmlEmail,
    handleContactRequest,
    DEFAULT_ADMIN_RECIPIENT,
    DEFAULT_SENDER_IDENTITY,
  } = contactHandlerModule;

  const workerModule = await import('../src/worker/index.ts');
  const worker = workerModule.default;

  it('1. Server-side destination recipient is strictly locked to ayushprakash0021@gmail.com', () => {
    assert.equal(
      DEFAULT_ADMIN_RECIPIENT,
      'ayushprakash0021@gmail.com',
      'Administrative recipient must be locked to ayushprakash0021@gmail.com'
    );
  });

  it('2. Payload validation enforces required fields, lengths, and email format', () => {
    // Valid payload
    const validResult = validateContactPayload({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@supplychain.org',
      organization: 'Global Logistics Forum',
      subject: 'Keynote Speaker Inquiry',
      message: 'We would love to invite you to speak on autonomous supply chain systems.',
    });
    assert.equal(validResult.valid, true);
    assert.equal(validResult.sanitized.name, 'Sarah Jenkins');
    assert.equal(validResult.sanitized.email, 'sarah.jenkins@supplychain.org');

    // Missing / short name
    const shortNameResult = validateContactPayload({
      name: 'A',
      email: 'sarah@org.com',
      message: 'Valid message content for the test.',
    });
    assert.equal(shortNameResult.valid, false);
    assert.match(shortNameResult.error, /Name is required/);

    // Invalid email
    const invalidEmailResult = validateContactPayload({
      name: 'Sarah Jenkins',
      email: 'not-an-email',
      message: 'Valid message content for the test.',
    });
    assert.equal(invalidEmailResult.valid, false);
    assert.match(invalidEmailResult.error, /valid email address/);

    // Message too short (< 10 chars)
    const shortMsgResult = validateContactPayload({
      name: 'Sarah Jenkins',
      email: 'sarah@org.com',
      message: 'Too short',
    });
    assert.equal(shortMsgResult.valid, false);
    assert.match(shortMsgResult.error, /Message is required/);

    // Organization max length check (> 150 chars)
    const longOrgResult = validateContactPayload({
      name: 'Sarah Jenkins',
      email: 'sarah@org.com',
      organization: 'A'.repeat(151),
      message: 'Valid message content for the test.',
    });
    assert.equal(longOrgResult.valid, false);
    assert.match(longOrgResult.error, /Organization exceeds maximum length/);
  });

  it('3. Honeypot traps spam bots and immediately rejects malicious submissions', () => {
    const botResult = validateContactPayload({
      name: 'Spam Bot',
      email: 'spammer@botnet.ru',
      message: 'Cheap SEO backlinks and crypto investments.',
      hp_website: 'https://spam-link.example.com',
    });
    assert.equal(botResult.valid, false);
    assert.match(botResult.error, /Spam filter triggered/);
  });

  it('4. HTML escaping prevents XSS and HTML injection in transactional email templates', () => {
    const unescaped = '<script>alert("XSS")</script>&"\'';
    const escaped = escapeHtml(unescaped);
    assert.equal(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;&quot;&#039;');
    assert.ok(!escaped.includes('<script>'));
  });

  it('5. Email builders construct valid plain text and luxury HTML templates with Reply-To visitor context', () => {
    const data = {
      name: 'Alex Rivera',
      email: 'alex@enterprise-logistics.com',
      organization: 'Rivera Operations Group',
      subject: 'Strategic Supply Chain Advisory',
      message: 'Inquiring about advisory roles for Q1 2026 enterprise system rollout.',
      timestamp: '2026-11-05T07:00:00.000Z',
    };

    const plain = buildPlainEmail(data);
    assert.ok(plain.includes('Alex Rivera'));
    assert.ok(plain.includes('alex@enterprise-logistics.com'));
    assert.ok(plain.includes('Rivera Operations Group'));
    assert.ok(plain.includes('Reply-To has been set to the visitor\'s verified email address'));

    const html = buildHtmlEmail(data);
    assert.ok(html.includes('Alex Rivera'));
    assert.ok(html.includes('alex@enterprise-logistics.com'));
    assert.ok(html.includes('Rivera Operations Group'));
    assert.ok(html.includes('mailto:alex@enterprise-logistics.com'));
    assert.ok(html.includes(DEFAULT_ADMIN_RECIPIENT));
    assert.ok(html.includes('Inquiring about advisory roles for Q1 2026'));
  });

  it('6. Endpoint handles OPTIONS CORS preflight and rejects unsupported HTTP methods', async () => {
    const optionsReq = new Request('https://resume-portfolio.ayushprakash0021.workers.dev/api/contact/submit', {
      method: 'OPTIONS',
      headers: { Origin: 'https://ayushprakash.me' },
    });
    const optionsRes = await worker.fetch(optionsReq, { ASSETS: { fetch: async () => new Response() } });
    assert.equal(optionsRes.status, 204);
    assert.equal(optionsRes.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');

    const getReq = new Request('https://resume-portfolio.ayushprakash0021.workers.dev/api/contact/submit', {
      method: 'GET',
    });
    const getRes = await worker.fetch(getReq, { ASSETS: { fetch: async () => new Response() } });
    assert.equal(getRes.status, 405);
  });

  it('7. Endpoint returns 503 with MISSING_EMAIL_CREDENTIALS when RESEND_API_KEY is not configured', async () => {
    const submitReq = new Request('https://resume-portfolio.ayushprakash0021.workers.dev/api/contact/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@supplychain.org',
        organization: 'Global Logistics Forum',
        subject: 'Speaking Inquiry',
        message: 'We would love to have you present your Orion-9 supply chain OS architecture.',
      }),
    });

    const envWithoutKey = {
      ASSETS: { fetch: async () => new Response() },
    };

    const res = await worker.fetch(submitReq, envWithoutKey);
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.code, 'MISSING_EMAIL_CREDENTIALS');
    assert.equal(data.recipientConfigured, 'ayushprakash0021@gmail.com');
  });

  it('8. Visitor cannot override server-side recipient through API payload parameters', async () => {
    let capturedResendPayload = null;

    // Mock global fetch to intercept Resend API call
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      if (typeof url === 'string' && url.includes('api.resend.com/emails')) {
        capturedResendPayload = JSON.parse(options.body);
        return new Response(JSON.stringify({ id: 're_test_99887766' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return originalFetch(url, options);
    };

    try {
      const maliciousReq = new Request('https://resume-portfolio.ayushprakash0021.workers.dev/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Attacker Attempting Redirect',
          email: 'attacker@evil.com',
          message: 'Testing if recipient destination can be overridden.',
          to: 'attacker-destination@evil.com',
          recipient: 'hacker@target.org',
          adminEmail: 'redirected@evil.com',
        }),
      });

      const envWithKey = {
        ASSETS: { fetch: async () => new Response() },
        RESEND_API_KEY: 're_mock_test_key_12345',
      };

      const res = await worker.fetch(maliciousReq, envWithKey);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.deliveredTo, 'ayushprakash0021@gmail.com');

      // Verify the intercepted Resend payload sent to 'ayushprakash0021@gmail.com' and NOT the attacker's destination
      assert.deepEqual(capturedResendPayload.to, ['ayushprakash0021@gmail.com']);
      assert.equal(capturedResendPayload.reply_to, 'attacker@evil.com');
      assert.equal(capturedResendPayload.subject, 'New Portfolio Enquiry — Attacker Attempting Redirect');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('9. Provider rejection returns 502 with PROVIDER_REJECTION and does NOT claim delivery', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      if (typeof url === 'string' && url.includes('api.resend.com/emails')) {
        return new Response(
          JSON.stringify({
            statusCode: 422,
            message: 'Domain not verified. You can only send testing emails to your own email address.',
            name: 'validation_error',
          }),
          { status: 422, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return originalFetch(url, options);
    };

    try {
      const submitReq = new Request('https://resume-portfolio.ayushprakash0021.workers.dev/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Jenkins',
          email: 'sarah@supplychain.org',
          message: 'Inquiry regarding operations consulting.',
        }),
      });

      const envWithKey = {
        ASSETS: { fetch: async () => new Response() },
        RESEND_API_KEY: 're_mock_test_key_12345',
      };

      const res = await worker.fetch(submitReq, envWithKey);
      assert.equal(res.status, 502);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.code, 'PROVIDER_REJECTION');
      assert.ok(data.details.includes('Domain not verified'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
