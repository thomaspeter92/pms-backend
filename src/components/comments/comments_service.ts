import { Repository } from "typeorm";
import { ApiResponse, BaseService } from "../../utils/base_service";
import { Comments } from "./comments_entity";
import { DatabaseUtil } from "../../utils/db";
import { Tasks } from "components/tasks/tasks_entity";

export class CommentsService extends BaseService<Comments> {
  private commentsRepository: Repository<Comments> | null = null;
  constructor() {
    let commentsRepository: Repository<Comments> | null = null;
    commentsRepository = new DatabaseUtil().getRepository(Comments);
    super(commentsRepository);
    this.commentsRepository = commentsRepository;
  }

  override async findAll(
    queryParams: object
  ): Promise<ApiResponse<Comments[]>> {
    try {
      const queryBuilder = this.commentsRepository
        .createQueryBuilder("comment")
        .leftJoin("comment.user_id", "user")
        .addSelect(["comment.*", "user.full_name"])
        .andWhere("comment.task_id = :taskId", {
          taskId: queryParams["task_id"],
        });

      const data = await queryBuilder.getMany();

      data.forEach((d) => {
        d["comment_author"] = d.user_id.full_name;
        delete d.user_id;
      });

      return { statusCode: 200, status: "success", data: data };
    } catch (error) {
      return {
        statusCode: 500,
        status: "error",
        message: "Internal server error",
      };
    }
  }
}
