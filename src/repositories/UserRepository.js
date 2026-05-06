import prisma from '../lib/prisma.js';

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data) {
    return prisma.user.create({ data });
  }

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  }

  async findByRole(role) {
    return prisma.user.findMany({ where: { role } });
  }

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  }
}

export const userRepository = new UserRepository();
