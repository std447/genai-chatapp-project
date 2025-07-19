import { Hono } from 'hono';
import { cors } from 'hono/cors';
import chatRouter from './routes/chat';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  maxAge: 600,
  credentials: true,
}));

app.route('/chat', chatRouter);

app.get('/', (c) => {
  return c.text('Cloudflare Worker AI Chat Backend is running!');
});

export default app;