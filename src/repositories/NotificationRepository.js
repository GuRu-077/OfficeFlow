import prisma from '../lib/prisma.js';

export class NotificationRepository {
  async findByUserId(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data) {
    return prisma.notification.create({ data });
  }

  async markAsRead(id) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }
}

export const notificationRepository = new NotificationRepository();
