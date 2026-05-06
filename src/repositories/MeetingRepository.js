import prisma from '../lib/prisma.js';

// Helper to parse JSON fields for meetings
function parseMeeting(meeting) {
  if (!meeting) return null;
  return {
    ...meeting,
    participantIds: typeof meeting.participantIds === 'string' ? JSON.parse(meeting.participantIds) : meeting.participantIds,
    resourceIds: typeof meeting.resourceIds === 'string' ? JSON.parse(meeting.resourceIds) : meeting.resourceIds,
  };
}

export class MeetingRepository {
  async findAll() {
    const meetings = await prisma.meeting.findMany({ orderBy: { createdAt: 'desc' } });
    return meetings.map(parseMeeting);
  }

  async findById(id) {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    return parseMeeting(meeting);
  }

  async findByRoomAndDate(roomId, date) {
    const meetings = await prisma.meeting.findMany({ where: { roomId, date } });
    return meetings.map(parseMeeting);
  }

  async create(data) {
    const meetingData = {
      ...data,
      participantIds: Array.isArray(data.participantIds) ? JSON.stringify(data.participantIds) : (data.participantIds ?? '[]'),
      resourceIds: Array.isArray(data.resourceIds) ? JSON.stringify(data.resourceIds) : (data.resourceIds ?? '[]'),
    };
    const meeting = await prisma.meeting.create({ data: meetingData });
    return parseMeeting(meeting);
  }

  async update(id, data) {
    const updateData = { ...data };
    if (Array.isArray(updateData.participantIds)) {
      updateData.participantIds = JSON.stringify(updateData.participantIds);
    }
    if (Array.isArray(updateData.resourceIds)) {
      updateData.resourceIds = JSON.stringify(updateData.resourceIds);
    }
    const meeting = await prisma.meeting.update({ where: { id }, data: updateData });
    return parseMeeting(meeting);
  }

  async delete(id) {
    await prisma.meeting.delete({ where: { id } });
    return true;
  }
}

export const meetingRepository = new MeetingRepository();
