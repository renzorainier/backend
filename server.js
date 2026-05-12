// server.js
const { WebcastPushConnection } = require('tiktok-live-connector');
const { Server } = require('socket.io');

// 1. Setup WebSocket Server dynamically for Render
const PORT = process.env.PORT || 4000;
const io = new Server(PORT, {
  cors: {
    origin: "*", // Allow your Vercel app to connect
    methods: ["GET", "POST"]
  }
});

console.log(`WebSocket server running on port ${PORT}`);

// 2. Change this to the TikTok username you want to track
const tiktokUsername = "renz.rainier";

const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

console.log(`Connecting to TikTok Live: @${tiktokUsername}...`);

// 3. Connect to TikTok
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

// (Optional) Handle stream ending
tiktokLiveConnection.on('streamEnd', () => {
    console.warn("Stream ended.");
});
