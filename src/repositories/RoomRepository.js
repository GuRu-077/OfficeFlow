import prisma from '../lib/prisma.js';

// Helper to parse JSON fields for rooms
function parseRoom(room) {
  if (!room) return null;
  return {
    ...room,
    amenities: typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities,
  };
}

export class RoomRepository {
  async findAll() {
    const rooms = await prisma.room.findMany({ orderBy: { name: 'asc' } });
    return rooms.map(parseRoom);
  }

  async findById(id) {
    const room = await prisma.room.findUnique({ where: { id } });
    return parseRoom(room);
  }

  async create(data) {
    const roomData = {
      ...data,
      amenities: Array.isArray(data.amenities) ? JSON.stringify(data.amenities) : data.amenities,
    };
    const room = await prisma.room.create({ data: roomData });
    return parseRoom(room);
  }

  async update(id, data) {
    const updateData = { ...data };
    if (Array.isArray(updateData.amenities)) {
      updateData.amenities = JSON.stringify(updateData.amenities);
    }
    const room = await prisma.room.update({ where: { id }, data: updateData });
    return parseRoom(room);
  }

  async delete(id) {
    await prisma.room.delete({ where: { id } });
    return true;
  }
}

export const roomRepository = new RoomRepository();
