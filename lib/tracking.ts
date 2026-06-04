"use client";

import { siteConfig } from "@/lib/siteConfig";

type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

type FacebookPixel = {
  (method: "trackCustom", eventName: string, payload?: TrackingPayload, options?: { eventID?: string }): void;
  (method: "track", eventName: string, payload?: TrackingPayload, options?: { eventID?: string }): void;
};

type MetaEventOptions = {
  custom?: boolean;
  eventId?: string;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
  }
}

function createEventId(eventName: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${eventName}.${random}`;
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

function shouldSendMetaTestEvent() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("capi_test");

    if (flag === "1") {
      window.sessionStorage.setItem("metaCapiTest", "1");
      return true;
    }

    if (flag === "0") {
      window.sessionStorage.removeItem("metaCapiTest");
      return false;
    }

    return window.sessionStorage.getItem("metaCapiTest") === "1";
  } catch (error) {
    return false;
  }
}

function sendCapiEvent(eventName: string, eventId: string, payload: TrackingPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const endpoint = siteConfig.metaCapiEndpoint;
  if (!endpoint) {
    return;
  }

  const body = {
    customData: payload,
    eventId,
    eventName,
    eventSourceUrl: window.location.href,
    fbc: getCookieValue("_fbc"),
    fbp: getCookieValue("_fbp"),
    testEvent: shouldSendMetaTestEvent(),
  };

  try {
    window
      .fetch(endpoint, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "POST",
      })
      .catch(() => {});
  } catch (error) {}
}

export function trackMetaEvent(eventName: string, payload: TrackingPayload = {}, options: MetaEventOptions = {}) {
  if (typeof window === "undefined") {
    return "";
  }

  const eventId = options.eventId ?? createEventId(eventName);

  try {
    if (options.custom) {
      window.fbq?.("trackCustom", eventName, payload, { eventID: eventId });
    } else {
      window.fbq?.("track", eventName, payload, { eventID: eventId });
    }
  } catch (error) {}

  sendCapiEvent(eventName, eventId, payload);

  return eventId;
}

export function trackPageView(payload: TrackingPayload = {}) {
  return trackMetaEvent("PageView", payload);
}
