import { BaseService } from "../../utils/base_service";
import { Repository } from "typeorm";
import { DatabaseUtil } from "../../utils/db";
import { Projects } from "./projects_entity";

export class ProjectsService extends BaseService<Projects> {
  constructor() {
    const databaseUtil = new DatabaseUtil();

    const projectsRepository: Repository<Projects> =
      databaseUtil.getRepository(Projects);

    super(projectsRepository);
  }
}
