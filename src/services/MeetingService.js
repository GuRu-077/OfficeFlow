import { meetingRepository } from "../repositories/MeetingRepository.js";
import { roomRepository } from "../repositories/RoomRepository.js";
import { resourceRepository } from "../repositories/ResourceRepository.js";
import { userRepository } from "../repositories/UserRepository.js";
import { notificationRepository } from "../repositories/NotificationRepository.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";

export class MeetingService {
  async getAllMeetings() {
    return meetingRepository.findAll();
  }

  async getMeetingById(id) {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) throw new NotFoundError("Meeting not found");
    return meeting;
  }

  async createMeeting(meetingData) {
    // 1. Room Validation
    const room = await roomRepository.findById(meetingData.roomId);
    if (!room) throw new ValidationError("Room does not exist");
    
    // Check if the room itself is marked as unavailable
    if (room.availability !== "available")
      throw new ValidationError("Room is not available (maintenance or inactive)");

    // 2. Conflict Detection for Room
    const existingMeetings = await meetingRepository.findByRoomAndDate(
      meetingData.roomId,
      meetingData.date,
    );
    for (const existing of existingMeetings) {
      if (existing.status === "cancelled" || existing.status === "rejected")
        continue;
      
      if (
        existing.startTime < meetingData.endTime &&
        existing.endTime > meetingData.startTime
      ) {
        // Find alternative rooms before throwing conflict
        const alternatives = await this.findAlternativeRooms(
          meetingData.date,
          meetingData.startTime,
          meetingData.endTime,
          room.capacity
        );

        const error = new ConflictError("Room is already booked for the requested time slot");
        error.alternatives = alternatives;
        throw error;
      }
    }

    // 3. Resource Validation
    if (meetingData.resourceIds && meetingData.resourceIds.length > 0) {
      for (const resId of meetingData.resourceIds) {
        const resource = await resourceRepository.findById(resId);
        if (!resource || resource.status !== "active") {
          throw new ValidationError(`Resource ${resId} is unavailable`);
        }
      }
    }

    // Create meeting
    const meeting = await meetingRepository.create({
      ...meetingData,
      status: meetingData.status || "pending",
    });

    // 4. Notifications
    if (meeting.status === "pending") {
      const managers = await userRepository.findByRole("Manager");
      const admins = await userRepository.findByRole("Admin");
      const staff = [...managers, ...admins];

      for (const person of staff) {
        await notificationRepository.create({
          userId: person.id,
          message: `New meeting request: "${meeting.title}" requires your approval.`,
          type: "approval_needed", // Added type for UI icons
        });
      }
    }

    return meeting;
  }

  async findAlternativeRooms(date, startTime, endTime, minCapacity = 0) {
    const allRooms = await roomRepository.findAll();
    const availableRooms = [];

    for (const room of allRooms) {
      if (room.status !== "active" || room.availability !== "available") continue;
      if (room.capacity < minCapacity) continue;

      const meetings = await meetingRepository.findByRoomAndDate(room.id, date);
      const hasConflict = meetings.some(m => 
        m.status !== "cancelled" && 
        m.status !== "rejected" &&
        m.startTime < endTime && 
        m.endTime > startTime
      );

      if (!hasConflict) {
        availableRooms.push(room);
      }
    }

    return availableRooms.slice(0, 3); // Suggest top 3
  }

  async updateMeeting(id, updates) {
    const meeting = await meetingRepository.update(id, updates);
    if (!meeting) throw new NotFoundError("Meeting not found");
    return meeting;
  }

  async cancelMeeting(id) {
    const meeting = await meetingRepository.update(id, { status: "cancelled" });
    if (!meeting) throw new NotFoundError("Meeting not found");
    return meeting;
  }
}

export const meetingService = new MeetingService();
