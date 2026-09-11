import type { APIRoute } from 'astro';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] ?? char));

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  if (formData.get('company_website')) {
    return json(200, { message: "Thanks — we'll be in touch soon." });
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const organisation = String(formData.get('organisation') ?? '').trim();
  const show = String(formData.get('show') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !email.includes('@') || !message) {
    return json(400, { message: 'Please fill in your name, email and message.' });
  }

  const apiKey = import.meta.env.BREVO_API_KEY;
  const senderEmail = import.meta.env.BREVO_SENDER_EMAIL;
  const senderName = import.meta.env.BREVO_SENDER_NAME ?? 'The Manchesters website';
  const bookingsEmail = import.meta.env.BOOKINGS_EMAIL;

  if (!apiKey || !senderEmail || !bookingsEmail) {
    console.error('Missing Brevo env vars for enquiry email.');
    return json(500, { message: 'Enquiries are temporarily unavailable — please email us directly.' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: bookingsEmail }],
        replyTo: { email, name },
        subject: `Booking enquiry from ${name}${organisation ? ` (${organisation})` : ''}`,
        htmlContent: `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Cruise line / theatre / venue:</strong> ${escapeHtml(organisation || 'Not provided')}</p>
          <p><strong>Show:</strong> ${escapeHtml(show || 'Not specified')}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
        `,
      }),
    });

    if (response.ok) {
      return json(200, { message: "Thanks — we'll be in touch soon." });
    }

    const errorBody = await response.text();
    console.error('Brevo transactional email failed:', response.status, errorBody);
    return json(502, { message: 'Something went wrong sending your enquiry — please email us directly.' });
  } catch (error) {
    console.error('Brevo request failed:', error);
    return json(502, { message: 'Something went wrong sending your enquiry — please email us directly.' });
  }
};
