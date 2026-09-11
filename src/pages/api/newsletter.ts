import type { APIRoute } from 'astro';

// Opting out of prerendering turns this route into a Vercel serverless
// function (rather than being baked into the static output at build time).
export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  // Honeypot: bots tend to fill in every field, real visitors never see this one.
  if (formData.get('company_website')) {
    return json(200, { message: "You're on the list — thank you!" });
  }

  const email = String(formData.get('email') ?? '').trim();
  if (!email || !email.includes('@')) {
    return json(400, { message: 'Please enter a valid email address.' });
  }

  const apiKey = import.meta.env.BREVO_API_KEY;
  const listId = Number(import.meta.env.BREVO_LIST_ID);

  if (!apiKey || !listId) {
    console.error('Missing BREVO_API_KEY or BREVO_LIST_ID environment variables.');
    return json(500, { message: 'Signup is temporarily unavailable. Please try again later.' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    // Brevo returns 204 on success, and 400 with code "duplicate_parameter"
    // if the contact already exists — both are fine outcomes for a signup form.
    if (response.ok || response.status === 400) {
      return json(200, { message: "You're on the list — thank you!" });
    }

    const errorBody = await response.text();
    console.error('Brevo contact create failed:', response.status, errorBody);
    return json(502, { message: 'Something went wrong. Please try again shortly.' });
  } catch (error) {
    console.error('Brevo request failed:', error);
    return json(502, { message: 'Something went wrong. Please try again shortly.' });
  }
};
