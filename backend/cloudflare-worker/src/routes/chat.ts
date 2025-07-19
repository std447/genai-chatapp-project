import { Hono } from 'hono';
import { ChatRequest, ChatSuccessResponse, ChatErrorResponse } from '@shared-types/index';
import { checkAndIncrementRateLimit } from '../utils/rateLimit';
import { getGroqChatCompletion } from '../api/groq';

const chatRouter = new Hono<{ Bindings: Env }>();

chatRouter.post('/', async (c) => {
  try {
    const { message, fingerprint } = await c.req.json<ChatRequest>();

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return c.json<ChatErrorResponse>({ error: 'Message is required and must be a non-empty string.' }, 400);
    }

    const ip = c.req.header('CF-Connecting-IP');
    let anonymousId: string;
    if (ip) {
      anonymousId = fingerprint ? `anon_${ip}_${fingerprint}` : `anon_${ip}`;
    } else {
      console.warn('CF-Connecting-IP header not found. Using fallback for local development/testing.');
      const fallbackIp = c.req.raw.headers.get('x-real-ip') || 'unknown_ip_local_dev';
      anonymousId = fingerprint ? `anon_${fallbackIp}_${fingerprint}` : `anon_${fallbackIp}`;
    }

    const { isRateLimited, errorMessage } = await checkAndIncrementRateLimit(c.env.CHATAPP_KV, anonymousId);

    if (isRateLimited) {
      return c.json<ChatErrorResponse>({ error: errorMessage || 'Rate limit exceeded.', code: 'RATE_LIMIT_EXCEEDED' }, 429);
    }

    const aiResponse = await getGroqChatCompletion(c.env.GROQ_API_KEY, message);

    return c.json<ChatSuccessResponse>({ response: aiResponse });

  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return c.json<ChatErrorResponse>({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default chatRouter;