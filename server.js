import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ZodError } from 'zod';

// Services
import { userRepository } from './src/repositories/UserRepository.js';
import { roomService } from './src/services/RoomService.js';
import { resourceService } from './src/services/ResourceService.js';
import { meetingService } from './src/services/MeetingService.js';
import { notificationRepository } from './src/repositories/NotificationRepository.js';

// Utils
import { signMockToken, verifyMockToken } from './src/utils/auth.js';
import { AppError } from './src/utils/errors.js';
import { sendSuccess, sendError } from './src/utils/expressResponse.js';

// Validations
import {
  loginSchema,
  createRoomSchema,
  updateRoomSchema,
  createResourceSchema,
  updateResourceSchema,
  createMeetingSchema,
} from './src/validations/index.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port (for dev) or no origin (curl/server-side)
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ─── Auth Middleware ─────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing token' });
  }
  const payload = verifyMockToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
  req.user = payload;
  next();
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = loginSchema.parse(req.body);
    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const token = signMockToken(user);
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
    return sendSuccess(res, { user, token });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }
    return sendError(res, error);
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  return sendSuccess(res, { message: 'Logged out' });
});

// ─── Users Routes ────────────────────────────────────────────────────────────
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await userRepository.findAll();
    return sendSuccess(res, users);
  } catch (error) { return sendError(res, error); }
});

app.get('/api/users/:id/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await notificationRepository.findByUserId(req.params.id);
    return sendSuccess(res, notifications);
  } catch (error) { return sendError(res, error); }
});

// ─── Rooms Routes ────────────────────────────────────────────────────────────
app.get('/api/rooms', requireAuth, async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    return sendSuccess(res, rooms);
  } catch (error) { return sendError(res, error); }
});

app.post('/api/rooms', requireAuth, async (req, res) => {
  try {
    const data = createRoomSchema.parse(req.body);
    const room = await roomService.createRoom(data);
    return sendSuccess(res, room, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }
    return sendError(res, error);
  }
});

app.get('/api/rooms/:id', requireAuth, async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    return sendSuccess(res, room);
  } catch (error) { return sendError(res, error); }
});

app.put('/api/rooms/:id', requireAuth, async (req, res) => {
  try {
    const data = updateRoomSchema.parse(req.body);
    const room = await roomService.updateRoom(req.params.id, data);
    return sendSuccess(res, room);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }
    return sendError(res, error);
  }
});

app.delete('/api/rooms/:id', requireAuth, async (req, res) => {
  try {
    await roomService.deleteRoom(req.params.id);
    return sendSuccess(res, { deleted: true });
  } catch (error) { return sendError(res, error); }
});

// ─── Resources Routes ────────────────────────────────────────────────────────
app.get('/api/resources', requireAuth, async (req, res) => {
  try {
    const resources = await resourceService.getAllResources();
    return sendSuccess(res, resources);
  } catch (error) { return sendError(res, error); }
});

app.post('/api/resources', requireAuth, async (req, res) => {
  try {
    const data = createResourceSchema.parse(req.body);
    const resource = await resourceService.createResource(data);
    return sendSuccess(res, resource, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }
    return sendError(res, error);
  }
});

app.get('/api/resources/:id', requireAuth, async (req, res) => {
  try {
    const resource = await resourceService.getResourceById(req.params.id);
    return sendSuccess(res, resource);
  } catch (error) { return sendError(res, error); }
});

app.put('/api/resources/:id', requireAuth, async (req, res) => {
  try {
    const data = updateResourceSchema.parse(req.body);
    const resource = await resourceService.updateResource(req.params.id, data);
    return sendSuccess(res, resource);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }
    return sendError(res, error);
  }
});

app.delete('/api/resources/:id', requireAuth, async (req, res) => {
  try {
    await resourceService.deleteResource(req.params.id);
    return sendSuccess(res, { deleted: true });
  } catch (error) { return sendError(res, error); }
});

// ─── Meetings Routes ─────────────────────────────────────────────────────────
app.get('/api/meetings', requireAuth, async (req, res) => {
  try {
    const meetings = await meetingService.getAllMeetings();
    return sendSuccess(res, meetings);
  } catch (error) { return sendError(res, error); }
});

app.post('/api/meetings', requireAuth, async (req, res) => {
  try {
    const status = req.user.role === 'Admin' || req.user.role === 'Manager' ? 'confirmed' : 'pending';
    const meeting = await meetingService.createMeeting({
      ...data,
      requestedBy: req.user.userId,
      status,
    });
    return sendSuccess(res, meeting, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
    }
    return sendError(res, error);
  }
});

app.get('/api/meetings/:id', requireAuth, async (req, res) => {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id);
    return sendSuccess(res, meeting);
  } catch (error) { return sendError(res, error); }
});

app.put('/api/meetings/:id', requireAuth, async (req, res) => {
  try {
    const originalMeeting = await meetingService.getMeetingById(req.params.id);
    const meeting = await meetingService.updateMeeting(req.params.id, req.body);
    
    // If status changed to approved or rejected, notify the requester
    if (req.body.status && req.body.status !== originalMeeting.status) {
      const statusLabel = req.body.status === 'approved' || req.body.status === 'confirmed' ? 'APPROVED' : 'REJECTED';
      await notificationRepository.create({
        userId: originalMeeting.requestedBy,
        message: `Your meeting "${originalMeeting.title}" has been ${statusLabel}.`,
        type: req.body.status === 'approved' || req.body.status === 'confirmed' ? 'success' : 'error'
      });
    }
    
    return sendSuccess(res, meeting);
  } catch (error) { return sendError(res, error); }
});

app.delete('/api/meetings/:id', requireAuth, async (req, res) => {
  try {
    await meetingService.cancelMeeting(req.params.id);
    return sendSuccess(res, { cancelled: true });
  } catch (error) { return sendError(res, error); }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OfficeFlow API is running', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  return sendError(res, err);
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🚀  OfficeFlow API Server');
  console.log(`  ✅  Running at: http://localhost:${PORT}`);
  console.log(`  📋  Health:    http://localhost:${PORT}/api/health`);
  console.log('');
});
