import { Repository } from "typeorm";
import { BaseService } from "../../utils/base_service";
import { Comments } from "./comments_entity";
import { DatabaseUtil } from "../../utils/db";

export class CommentsService extends BaseService<Comments> {
  constructor() {
    let commentsRepository: Repository<Comments> | null = null;
    commentsRepository = new DatabaseUtil().getRepository(Comments);
    super(commentsRepository);
  }
}
