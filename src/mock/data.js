export const MOCK_USERS = [
  {
    id: "1",
    name: "Alice Admin",
    email: "admin@officeflow.com",
    role: "Admin",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bob Manager",
    email: "manager@officeflow.com",
    role: "Manager",
    department: "Engineering",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Charlie Employee",
    email: "employee@officeflow.com",
    role: "Employee",
    department: "Engineering",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_ROOMS = [
  {
    id: "r1",
    name: "Boardroom A",
    capacity: 20,
    location: "Building 1",
    floor: "10",
    amenities: ["Projector", "Whiteboard", "Video Conferencing"],
    availability: "available",
    status: "active",
  },
  {
    id: "r2",
    name: "Huddle Room B",
    capacity: 5,
    location: "Building 1",
    floor: "10",
    amenities: ["Whiteboard", "TV"],
    availability: "available",
    status: "active",
  },
  {
    id: "r3",
    name: "Conference C",
    capacity: 10,
    location: "Building 2",
    floor: "2",
    amenities: ["Projector"],
    availability: "unavailable",
    status: "active",
  },
];

export const MOCK_RESOURCES = [
  {
    id: "res1",
    name: "MacBook Pro",
    type: "Laptop",
    quantity: 5,
    availableCount: 5,
    status: "active",
  },
  {
    id: "res2",
    name: "Laser Pointer",
    type: "Accessory",
    quantity: 10,
    availableCount: 10,
    status: "active",
  },
  {
    id: "res3",
    name: "Portable Projector",
    type: "Projector",
    quantity: 2,
    availableCount: 1,
    status: "active",
  },
];

export const MOCK_MEETINGS = [
  {
    id: "m1",
    title: "Q3 Planning",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    roomId: "r1",
    requestedBy: "1",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "m2",
    title: "Team Sync",
    date: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "15:00",
    roomId: "r2",
    requestedBy: "2",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_NOTIFICATIONS = [];
