import { resourceRepository } from "../repositories/ResourceRepository.js";
import { NotFoundError } from "../utils/errors.js";

export class ResourceService {
  async getAllResources() {
    return resourceRepository.findAll();
  }

  async getResourceById(id) {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError("Resource not found");
    }
    return resource;
  }

  async createResource(resourceData) {
    return resourceRepository.create(resourceData);
  }

  async updateResource(id, updates) {
    const resource = await resourceRepository.update(id, updates);
    if (!resource) {
      throw new NotFoundError("Resource not found");
    }
    return resource;
  }

  async deleteResource(id) {
    const success = await resourceRepository.delete(id);
    if (!success) {
      throw new NotFoundError("Resource not found");
    }
  }
}

export const resourceService = new ResourceService();
