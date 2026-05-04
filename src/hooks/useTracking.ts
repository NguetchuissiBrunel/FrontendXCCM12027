import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

type BehaviorEventType =
  | "CONTENT_READ"
  | "VIDEO_WATCHED"
  | "DOCUMENT_DOWNLOADED"
  | "AI_QUESTION_ASKED"
  | "AI_REFORMULATION_REQUESTED"
  | "NOTEBOOK_ANALYZED"
  | "EXERCISE_SUBMITTED";

interface BehaviorEventPayload {
  eventType: BehaviorEventType;
  notion: string;
  granuleId?: number;
  rawScore?: number;
  durationSeconds?: number;
  readDepthPercent?: number;
  metadata?: Record<string, unknown>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

/**
 * Hook to track student behavioral events and send them to the Java backend.
 *
 * Usage:
 *  const { trackEvent, trackReading } = useTracking("Algorithmes de tri");
 *
 *  // Log a simple event
 *  trackEvent({ eventType: "DOCUMENT_DOWNLOADED", notion: "POO" });
 *
 *  // Attach automatic reading tracking to a div
 *  <div ref={trackReading(granuleId)} />
 */
export function useTracking(defaultNotion?: string) {
  const { token, user } = useAuth();
  const readStartRef = useRef<number | null>(null);
  const maxScrollRef = useRef(0);

  // Resets scroll tracking on unmount
  useEffect(() => {
    maxScrollRef.current = 0;
    return () => {
      maxScrollRef.current = 0;
    };
  }, [defaultNotion]);

  const trackEvent = useCallback(
    async (payload: BehaviorEventPayload) => {
      if (!user || !token) return;
      try {
        await fetch(`${BACKEND_URL}/api/v1/behavior/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...payload,
            metadata: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
          }),
        });
      } catch (err) {
        // Silent fail: tracking should never break the UI
        console.warn("[useTracking] Failed to log event:", err);
      }
    },
    [user, token]
  );

  /**
   * Returns a ref to attach to a content container.
   * Automatically tracks:
   *  - Time spent on the content (durationSeconds)
   *  - Maximum scroll depth (readDepthPercent)
   */
  const trackReading = useCallback(
    (granuleId?: number, notion?: string) => (element: HTMLDivElement | null) => {
      if (!element) return;

      const currentNotion = notion || defaultNotion || "unknown";

      // Start timer when element becomes visible
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            readStartRef.current = Date.now();

            // Track scroll depth inside the element
            const handleScroll = () => {
              const { scrollTop, scrollHeight, clientHeight } = element;
              const depth = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);
              maxScrollRef.current = Math.max(maxScrollRef.current, Math.min(depth, 100));
            };

            element.addEventListener("scroll", handleScroll, { passive: true });
            window.addEventListener("scroll", handleScroll, { passive: true });

            return () => {
              element.removeEventListener("scroll", handleScroll);
              window.removeEventListener("scroll", handleScroll);
            };
          } else if (readStartRef.current !== null) {
            // User left the element - log the event
            const durationSeconds = Math.round((Date.now() - readStartRef.current) / 1000);
            readStartRef.current = null;

            // Only log if user spent more than 5 seconds reading
            if (durationSeconds > 5) {
              trackEvent({
                eventType: "CONTENT_READ",
                notion: currentNotion,
                granuleId,
                durationSeconds,
                readDepthPercent: maxScrollRef.current,
              });
            }
            maxScrollRef.current = 0;
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
    },
    [trackEvent, defaultNotion]
  );

  return { trackEvent, trackReading };
}
