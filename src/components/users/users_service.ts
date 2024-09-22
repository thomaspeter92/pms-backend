import { Repository } from "typeorm";
import { BaseService } from "../../utils/base_service";
import { Users } from "./users_entity";
import { DatabaseUtil } from "../../utils/db";

export class UsersService extends BaseService<Users> {
  constructor() {
    let usersRepository: Repository<Users> | null = null;
    usersRepository = new DatabaseUtil().getRepository(Users);
    super(usersRepository);
  }
}
