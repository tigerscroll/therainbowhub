const DEFAULT_PIXEL_ID = "843363384736830";
const DEFAULT_GRAPH_VERSION = "v23.0";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

function cleanObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""),
  );
}

function getClientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    undefined
  );
}

export async function onRequest(context) {
  const { env, request } = context;

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const accessToken = env.META_CAPI_ACCESS_TOKEN;

  if (!accessToken) {
    return jsonResponse({ ok: true, disabled: true, reason: "missing_meta_capi_access_token" });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const eventName = typeof body.eventName === "string" ? body.eventName.slice(0, 80) : "";
  const eventId = typeof body.eventId === "string" ? body.eventId.slice(0, 160) : "";

  if (!eventName || !eventId) {
    return jsonResponse({ error: "missing_event_name_or_event_id" }, 400);
  }

  const pixelId = env.META_PIXEL_ID || env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const graphVersion = env.META_CAPI_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;
  const eventSourceUrl = typeof body.eventSourceUrl === "string" ? body.eventSourceUrl : request.headers.get("Referer") || "";
  const userAgent = request.headers.get("User-Agent") || undefined;
  const customData = body.customData && typeof body.customData === "object" ? body.customData : {};

  const event = cleanObject({
    action_source: "website",
    custom_data: customData,
    event_id: eventId,
    event_name: eventName,
    event_source_url: eventSourceUrl,
    event_time: Math.floor(Date.now() / 1000),
    user_data: cleanObject({
      client_ip_address: getClientIp(request),
      client_user_agent: userAgent,
      fbc: typeof body.fbc === "string" ? body.fbc : undefined,
      fbp: typeof body.fbp === "string" ? body.fbp : undefined,
    }),
  });

  const metaBody = cleanObject({
    data: [event],
  });

  const url = new URL(`https://graph.facebook.com/${graphVersion}/${pixelId}/events`);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString(), {
    body: JSON.stringify(metaBody),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    return jsonResponse({ error: "meta_capi_error", meta: responseBody }, 502);
  }

  return jsonResponse({ ok: true, meta: responseBody });
}
