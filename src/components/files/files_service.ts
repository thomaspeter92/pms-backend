import { BaseService } from "../../utils/base_service";
import { Files } from "./files_entity";
import { DatabaseUtil } from "../../utils/db";
import { Repository } from "typeorm";

export class FilesService extends BaseService<Files> {
  constructor() {
    const databaseUtil = new DatabaseUtil();

    const filesRepository: Repository<Files> =
      databaseUtil.getRepository(Files);

    super(filesRepository);
  }
}
