export type Role = 'Admin' | 'Manager' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  designation?: string;
  profilePhoto?: string;
  timezone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  floor: string;
  amenities: string[];
  availability: 'available' | 'unavailable' | 'maintenance';
  status: 'active' | 'inactive';
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  quantity: number;
  availableCount: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export type MeetingStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'confirmed' | 'cancelled' | 'completed';

export interface Meeting {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  participantIds: string[];
  roomId: string;
  resourceIds: string[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  readStatus: boolean;
  createdAt: string;
}
