import { Repository } from "typeorm";
import { BaseService } from "utils/base_service";
import { DatabaseUtil } from "utils/db";
import { Roles } from "./roles_entity";

export class RolesService extends BaseService<Roles> {
  constructor() {
    // db instance
    const databaseUtil = new DatabaseUtil();

    const roleRepository: Repository<Roles> = databaseUtil.getRepository(Roles);

    // Call the constructor of the BaseService class with the repository as a parameter
    super(roleRepository);
  }
}
