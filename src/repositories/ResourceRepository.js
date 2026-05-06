import prisma from '../lib/prisma.js';

export class ResourceRepository {
  async findAll() {
    return prisma.resource.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id) {
    return prisma.resource.findUnique({ where: { id } });
  }

  async create(data) {
    return prisma.resource.create({ data });
  }

  async update(id, data) {
    return prisma.resource.update({ where: { id }, data });
  }

  async delete(id) {
    await prisma.resource.delete({ where: { id } });
    return true;
  }
}

export const resourceRepository = new ResourceRepository();
