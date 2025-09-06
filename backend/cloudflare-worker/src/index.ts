import { Hono } from 'hono';
import { cors } from 'hono/cors';
import chatRouter from './routes/chat';

const app = new Hono<{ Bindings: Env }>();

const normalizeOrigin = (origin: string): string => {
  return origin.trim().replace(/\/$/, ''); // Remove trailing slash if present
};

const getAllowedOrigins = (env: Env): string[] => {
  let origins: string[] = [];
  if (env.ALLOWED_ORIGIN) {
    origins = env.ALLOWED_ORIGIN.split(',')
      .map(origin => normalizeOrigin(origin)) // Normalize each configured origin
      .filter(Boolean); // Remove any empty strings after processing
  } else {
    origins = [normalizeOrigin('http://localhost:5173')]; // Default for local development, also normalized
  }
  return origins;
};


// app.use('*', async (c, next) => {
//   const requestMethod = c.req.method;
//   const requestPath = c.req.path;
//   const rawRequestOrigin = c.req.header('Origin'); // Keep raw for initial log
//   const normalizedRequestOrigin = rawRequestOrigin ? normalizeOrigin(rawRequestOrigin) : undefined; // Normalize for comparison
  
//   if (requestMethod === 'OPTIONS') {
//     console.log(`[PREFLIGHT CHECK] Request Method: ${requestMethod}`);
//     console.log(`[PREFLIGHT CHECK] Request Path: ${requestPath}`);
//     console.log(`[PREFLIGHT CHECK] Incoming Origin Header (Raw): ${rawRequestOrigin}`);
//     console.log(`[PREFLIGHT CHECK] Incoming Origin Header (Normalized): ${normalizedRequestOrigin}`);
    
//     const configuredAllowedOrigins = getAllowedOrigins(c.env);
//     console.log(`[PREFLIGHT CHECK] Configured Allowed Origins for CORS:`, configuredAllowedOrigins);
    
//     // Perform the check using the normalized origin
//     const isOriginIncluded = normalizedRequestOrigin && configuredAllowedOrigins.includes(normalizedRequestOrigin);
//     console.log(`[PREFLIGHT CHECK] Is Incoming Origin Allowed by Config? ${isOriginIncluded}`);
//   }
//   await next(); 
// });


app.use('*',async (c,next) => {
  
  const allowedOrigins = getAllowedOrigins(c.env);
  console.log("CORS ALLOWED ORIGINS",allowedOrigins)
  
  return cors({
    origin: allowedOrigins, // Now accepts an array of strings
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    maxAge: 600,
    credentials: true,
  })(c, next);

});

app.route('/chat', chatRouter);
app.get('/chat',(c)=>{
  return c.text('Chat route working')
})

app.get('/', (c) => {
  return c.text('Cloudflare Worker AI Chat Backend is running!');
});

export default app;