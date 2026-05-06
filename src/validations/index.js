import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
});

export const createMeetingSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    roomId: z.string().min(1, "Room is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM"),
    participantIds: z.array(z.string()).optional(),
    resourceIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      return data.startTime < data.endTime;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export const createRoomSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  location: z.string().min(1, "Location is required"),
  floor: z.string().min(1, "Floor is required"),
  amenities: z.array(z.string()),
  availability: z.enum(["available", "unavailable", "maintenance"]),
  status: z.enum(["active", "inactive"]),
});

export const updateRoomSchema = createRoomSchema.partial();

export const createResourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string().min(1, "Type is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  availableCount: z
    .number()
    .int()
    .nonnegative("Available count cannot be negative"),
  status: z.enum(["active", "inactive", "maintenance"]),
});

export const updateResourceSchema = createResourceSchema.partial();
