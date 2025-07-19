import { ANONYMOUS_PROMPT_LIMIT, LIMIT_WINDOW_HOURS } from '@shared-types/index';

/**
 * Checks and updates the rate limit for an anonymous user in KV.
 * @param kv The KVNamespace binding (e.g., c.env.CHATAPP_KV).
 * @param anonymousId A unique identifier for the anonymous user (e.g., derived from IP/fingerprint).
 * @returns An object indicating if the user is rate-limited and an optional error message.
 */
export async function checkAndIncrementRateLimit(
  kv: KVNamespace,
  anonymousId: string
): Promise<{ isRateLimited: boolean; errorMessage?: string }> {
  const kvKey = `rate_limit:${anonymousId}`;
  let rateLimitData: { count: number; lastReset: number } | null = null;

  try {
    const rawData = await kv.get(kvKey);
    if (rawData) {
      rateLimitData = JSON.parse(rawData);
    }
  } catch (parseError) {
    console.error("Error parsing KV data for key:", kvKey, parseError);
    rateLimitData = null;
  }

  const now = Date.now();
  const limitWindowMs = LIMIT_WINDOW_HOURS * 60 * 60 * 1000;

  if (!rateLimitData || (now - rateLimitData.lastReset) > limitWindowMs) {
    rateLimitData = { count: 1, lastReset: now };
    await kv.put(kvKey, JSON.stringify(rateLimitData), { expirationTtl: LIMIT_WINDOW_HOURS * 60 * 60 });
  } else {
    if (rateLimitData.count >= ANONYMOUS_PROMPT_LIMIT) {
      const timeRemainingMs = (rateLimitData.lastReset + limitWindowMs) - now;
      const totalMinutesRemaining = Math.ceil(timeRemainingMs / (60 * 1000));

      const hours = Math.floor(totalMinutesRemaining / 60);
      const minutes = totalMinutesRemaining % 60;

      const parts: string[] = [];
      if (hours > 0) {
        parts.push(`${hours} hr`);
      }
      if (minutes > 0) {
        parts.push(`${minutes} mins`);
      }
      const timeRemainingString = parts.length > 0 ? parts.join(' ') : 'less than a minute';

      return {
        isRateLimited: true,
        errorMessage: `Rate limit exceeded. You have used ${ANONYMOUS_PROMPT_LIMIT} prompts in the last ${LIMIT_WINDOW_HOURS} hours. Please try again in approximately ${timeRemainingString}.`,
      };
    }
    rateLimitData.count++;
    await kv.put(kvKey, JSON.stringify(rateLimitData), {
      expirationTtl: Math.ceil((rateLimitData.lastReset + limitWindowMs - now) / 1000)
    });
  }

  return { isRateLimited: false };
}