import { User, Room, Resource, Meeting, Notification } from './types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Admin', email: 'admin@officeflow.com', role: 'Admin', status: 'active', createdAt: new Date().toISOString() },
  { id: '2', name: 'Bob Manager', email: 'manager@officeflow.com', role: 'Manager', department: 'Engineering', status: 'active', createdAt: new Date().toISOString() },
  { id: '3', name: 'Charlie Employee', email: 'employee@officeflow.com', role: 'Employee', department: 'Engineering', status: 'active', createdAt: new Date().toISOString() }
];

const MOCK_ROOMS: Room[] = [
  { id: 'r1', name: 'Boardroom A', capacity: 20, location: 'Building 1', floor: '10', amenities: ['Projector', 'Whiteboard', 'Video Conferencing'], availability: 'available', status: 'active' },
  { id: 'r2', name: 'Huddle Room B', capacity: 5, location: 'Building 1', floor: '10', amenities: ['Whiteboard', 'TV'], availability: 'available', status: 'active' },
  { id: 'r3', name: 'Conference C', capacity: 10, location: 'Building 2', floor: '2', amenities: ['Projector'], availability: 'unavailable', status: 'active' }
];

const MOCK_RESOURCES: Resource[] = [
  { id: 'res1', name: 'MacBook Pro', type: 'Laptop', quantity: 5, availableCount: 5, status: 'active' },
  { id: 'res2', name: 'Laser Pointer', type: 'Accessory', quantity: 10, availableCount: 10, status: 'active' },
  { id: 'res3', name: 'Portable Projector', type: 'Projector', quantity: 2, availableCount: 1, status: 'active' }
];

const MOCK_MEETINGS: Meeting[] = [
  { id: 'm1', title: 'Q3 Planning', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', roomId: 'r1', requestedBy: '1', status: 'confirmed', createdAt: new Date().toISOString() },
  { id: 'm2', title: 'Team Sync', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', roomId: 'r2', requestedBy: '2', status: 'pending', createdAt: new Date().toISOString() }
];
const MOCK_NOTIFICATIONS: Notification[] = [];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Simple in-memory storage (in a real app this would be Firestore)
let users = [...MOCK_USERS];
let rooms = [...MOCK_ROOMS];
let resources = [...MOCK_RESOURCES];
let meetings = [...MOCK_MEETINGS];
let notifications = [...MOCK_NOTIFICATIONS];

export const db = {
  async getUsers(): Promise<User[]> {
    await delay(300);
    return [...users];
  },
  async getRooms(): Promise<Room[]> {
    await delay(300);
    return [...rooms];
  },
  async getResources(): Promise<Resource[]> {
    await delay(300);
    return [...resources];
  },
  async getMeetings(): Promise<Meeting[]> {
    await delay(300);
    return [...meetings];
  },
  async createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    await delay(500);
    const newMeeting: Meeting = {
      ...meeting,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    meetings.push(newMeeting);
    return newMeeting;
  },
  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    await delay(400);
    const index = meetings.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Meeting not found");
    meetings[index] = { ...meetings[index], ...updates, updatedAt: new Date().toISOString() };
    return meetings[index];
  },
  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(200);
    return notifications.filter(n => n.recipientId === userId);
  },
  
  // Rooms CRUD
  async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    await delay(400);
    const newRoom: Room = { ...room, id: Math.random().toString(36).substring(7) };
    rooms.push(newRoom);
    return newRoom;
  },
  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    await delay(300);
    const index = rooms.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Room not found");
    rooms[index] = { ...rooms[index], ...updates };
    return rooms[index];
  },
  async deleteRoom(id: string): Promise<void> {
    await delay(300);
    rooms = rooms.filter(r => r.id !== id);
  },

  // Resources CRUD
  async createResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
    await delay(400);
    const newResource: Resource = { ...resource, id: Math.random().toString(36).substring(7) };
    resources.push(newResource);
    return newResource;
  },
  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    await delay(300);
    const index = resources.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Resource not found");
    resources[index] = { ...resources[index], ...updates };
    return resources[index];
  },
  async deleteResource(id: string): Promise<void> {
    await delay(300);
    resources = resources.filter(r => r.id !== id);
  }
};
