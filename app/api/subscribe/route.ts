const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 30_000;
const recentRequests = new Map<string, number>();

function getClientKey(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const previousRequest = recentRequests.get(clientKey) ?? 0;
  recentRequests.set(clientKey, now);

  if (recentRequests.size > 500) {
    for (const [key, timestamp] of recentRequests) {
      if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
        recentRequests.delete(key);
      }
    }
  }

  return now - previousRequest < RATE_LIMIT_WINDOW_MS;
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return Response.json(
      { message: "Please wait a moment before trying again." },
      { status: 429 },
    );
  }

  let payload: { email?: unknown };
  try {
    payload = (await request.json()) as { email?: unknown };
  } catch {
    return Response.json(
      { message: "The signup request was not valid." },
      { status: 400 },
    );
  }

  const email =
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return Response.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient =
    process.env.CONTACT_NOTIFICATION_EMAIL ??
    "filippo.pasquadib@gmail.com";
  const sender =
    process.env.CONTACT_FROM_EMAIL ??
    "Filippo Portfolio <onboarding@resend.dev>";

  if (!apiKey) {
    return Response.json(
      {
        message:
          "Email delivery is not connected yet. Please try again soon.",
      },
      { status: 503 },
    );
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      reply_to: email,
      subject: "New signup for Filippo's updates",
      text: `${email} signed up to receive Filippo's updates.`,
    }),
  });

  if (!resendResponse.ok) {
    return Response.json(
      {
        message:
          "The signup could not be delivered. Please try again shortly.",
      },
      { status: 502 },
    );
  }

  return Response.json({
    message: "Your signup was sent to Filippo.",
  });
}
