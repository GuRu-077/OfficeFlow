import { roomRepository } from "../repositories/RoomRepository.js";
import { NotFoundError } from "../utils/errors.js";

export class RoomService {
  async getAllRooms() {
    return roomRepository.findAll();
  }

  async getRoomById(id) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new NotFoundError("Room not found");
    }
    return room;
  }

  async createRoom(roomData) {
    return roomRepository.create(roomData);
  }

  async updateRoom(id, updates) {
    const room = await roomRepository.update(id, updates);
    if (!room) {
      throw new NotFoundError("Room not found");
    }
    return room;
  }

  async deleteRoom(id) {
    const success = await roomRepository.delete(id);
    if (!success) {
      throw new NotFoundError("Room not found");
    }
  }
}

export const roomService = new RoomService();
