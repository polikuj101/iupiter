import http from 'node:http';
import { WebSocketServer } from 'ws';
import { handleTwilioStream } from './twilioStream.js';

const PORT = Number(process.env.PORT ?? 8080);

// Last-resort safety net: this process holds every concurrent phone call.
// A single call's edge case should never take the others down with it.
// (The per-message try/catch in twilioStream.ts is the real fix — this is
// defense in depth for anything that slips past it.)
process.on('unhandledRejection', (reason) => {
  console.error('[bridge] unhandled rejection (process kept alive):', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[bridge] uncaught exception (process kept alive):', err);
});

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, path: '/twilio-stream' });

wss.on('connection', (ws) => {
  handleTwilioStream(ws).catch((err) => {
    console.error('[bridge] unhandled error in call handler:', err);
    ws.close();
  });
});

server.listen(PORT, () => {
  console.log(`[bridge] listening on :${PORT} (ws path: /twilio-stream)`);
});
