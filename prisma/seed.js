import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../dev.db');

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const MOCK_USERS = [
  { id: '1', name: 'Alice Admin', email: 'admin@officeflow.com', role: 'Admin', status: 'active' },
  { id: '2', name: 'Bob Manager', email: 'manager@officeflow.com', role: 'Manager', department: 'Engineering', status: 'active' },
  { id: '3', name: 'Charlie Employee', email: 'employee@officeflow.com', role: 'Employee', department: 'Engineering', status: 'active' },
];

const MOCK_ROOMS = [
  { id: 'r1', name: 'Boardroom A', capacity: 20, location: 'Building 1', floor: '10', amenities: JSON.stringify(['Projector', 'Whiteboard', 'Video Conferencing']), availability: 'available', status: 'active' },
  { id: 'r2', name: 'Huddle Room B', capacity: 5, location: 'Building 1', floor: '10', amenities: JSON.stringify(['Whiteboard', 'TV']), availability: 'available', status: 'active' },
  { id: 'r3', name: 'Conference C', capacity: 10, location: 'Building 2', floor: '2', amenities: JSON.stringify(['Projector']), availability: 'unavailable', status: 'active' },
];

const MOCK_RESOURCES = [
  { id: 'res1', name: 'MacBook Pro', type: 'Laptop', quantity: 5, availableCount: 5, status: 'active' },
  { id: 'res2', name: 'Laser Pointer', type: 'Accessory', quantity: 10, availableCount: 10, status: 'active' },
  { id: 'res3', name: 'Portable Projector', type: 'Projector', quantity: 2, availableCount: 1, status: 'active' },
];

const today = new Date().toISOString().split('T')[0];

const MOCK_MEETINGS = [
  { id: 'm1', title: 'Q3 Planning', date: today, startTime: '10:00', endTime: '11:00', roomId: 'r1', requestedBy: '1', status: 'confirmed', participantIds: '[]', resourceIds: '[]' },
  { id: 'm2', title: 'Team Sync', date: today, startTime: '14:00', endTime: '15:00', roomId: 'r2', requestedBy: '2', status: 'pending', participantIds: '[]', resourceIds: '[]' },
];

async function main() {
  console.log('🌱 Seeding database...');
  await prisma.notification.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  for (const user of MOCK_USERS) await prisma.user.create({ data: user });
  console.log(`✅ Created ${MOCK_USERS.length} users`);

  for (const room of MOCK_ROOMS) await prisma.room.create({ data: room });
  console.log(`✅ Created ${MOCK_ROOMS.length} rooms`);

  for (const resource of MOCK_RESOURCES) await prisma.resource.create({ data: resource });
  console.log(`✅ Created ${MOCK_RESOURCES.length} resources`);

  for (const meeting of MOCK_MEETINGS) await prisma.meeting.create({ data: meeting });
  console.log(`✅ Created ${MOCK_MEETINGS.length} meetings`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
