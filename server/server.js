require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const { app } = require('./app');
const { connectDb } = require('./config/db');
const { seedDefaultAdmin } = require('./utils/seedDefaultAdmin');
const { verifyAccessToken } = require('./utils/jwt');
const { Message } = require('./models/Message');
const { ensureChatAllowed } = require('./controllers/messageController');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDb();
  await seedDefaultAdmin();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake && socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake && socket.handshake.query && socket.handshake.query.token);

    if (!token) return next(new Error('UNAUTHORIZED'));

    try {
      const payload = verifyAccessToken(token);
      socket.auth = { id: payload.sub, role: payload.role };
      return next();
    } catch (e) {
      return next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('chat:join', async ({ appointmentId }) => {
      try {
        await ensureChatAllowed({ appointmentId, auth: socket.auth });
        socket.join(`appt:${appointmentId}`);
        socket.emit('chat:joined', { appointmentId });
      } catch (err) {
        socket.emit('chat:error', { message: err && err.message ? err.message : 'Unable to join chat' });
      }
    });

    socket.on('chat:send', async ({ appointmentId, text }) => {
      try {
        await ensureChatAllowed({ appointmentId, auth: socket.auth });

        const senderModel = socket.auth.role === 'patient' ? 'Patient' : 'Doctor';
        const msg = await Message.create({
          appointment: appointmentId,
          senderModel,
          sender: socket.auth.id,
          senderRole: socket.auth.role,
          text,
        });

        io.to(`appt:${appointmentId}`).emit('chat:message', msg);
      } catch (err) {
        socket.emit('chat:error', { message: err && err.message ? err.message : 'Unable to send message' });
      }
    });

    socket.on('disconnect', () => {});
  });

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
