// server.js
const { WebcastPushConnection } = require('tiktok-live-connector');
const { Server } = require('socket.io');
const http = require('http'); // <-- ADDED

// 1. Create a basic HTTP server (Helps Render route traffic and pass health checks)
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('TikTok Live Backend is Running!\n');
    }
});

// 2. Attach Socket.io to the HTTP server with explicit CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allows any frontend to connect
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// 3. Setup TikTok Connection
const tiktokUsername = "_papanan";
const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

console.log(`Connecting to TikTok Live: @${tiktokUsername}...`);

tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

// 4. Listen for Follows
tiktokLiveConnection.on('follow', (data) => {
    console.log(`[FOLLOW] ${data.uniqueId} followed!`);
    io.emit('tiktok-event', { type: 'FOLLOW', name: data.uniqueId });
});

// 5. Listen for ALL Chat messages
tiktokLiveConnection.on('chat', (data) => {
    io.emit('tiktok-event', {
        type: 'CHAT',
        text: data.comment,
        name: data.uniqueId
    });
});

tiktokLiveConnection.on('streamEnd', () => {
    console.warn("Stream ended.");
});
