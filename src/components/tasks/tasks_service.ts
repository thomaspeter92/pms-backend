import { Repository } from "typeorm";
import { ApiResponse, BaseService } from "../../utils/base_service";
import { Tasks } from "./tasks_entity";
import { DatabaseUtil } from "../../utils/db";

export class TasksService extends BaseService<Tasks> {
  private tasksRepository: Repository<Tasks> | null = null;
  constructor() {
    let tasksRepository: Repository<Tasks> | null = null;
    tasksRepository = new DatabaseUtil().getRepository(Tasks);
    super(tasksRepository);
    this.tasksRepository = tasksRepository;
  }

  // Need to override findAll method here for additional functionality
  override async findAll(queryParams: object): Promise<ApiResponse<Tasks[]>> {
    try {
      const queryBuilder = this.tasksRepository
        .createQueryBuilder("task")
        .leftJoin("task.project_id", "project")
        .leftJoin("task.user_id", "user")
        .leftJoinAndSelect("task.comments", "comment")
        .addSelect([
          "task.*",
          "task.project_id as project",
          "project.name",
          "user.user_id",
          "user.username",
          "user.email",
        ]);

      if (queryParams["projectId"]) {
        queryBuilder.andWhere("project.project_id = :projectId", {
          projectId: `${queryParams["projectId"]}`,
        });
      }

      const data = await queryBuilder.getMany();
      data.forEach((d) => {
        d["projectDetails"] = d.project_id;
        d["userDetails"] = d.user_id;
        d["comment_count"] = d.comments.length;
        delete d.comments;
        delete d.project_id;
        delete d.user_id;
      });

      return { statusCode: 200, status: "success", data: data };
    } catch (error) {
      return {
        status: "error",
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }

  override async findOne(id: string): Promise<ApiResponse<Tasks>> {
    try {
      const where = {};
      const primaryKey: string =
        this.tasksRepository.metadata.primaryColumns[0].databaseName;
      where[primaryKey] = id;

      // Use repo to find entity based on id
      const data = await this.tasksRepository
        .createQueryBuilder("task")
        .leftJoin("task.project_id", "project")
        .leftJoin("task.user_id", "user")
        .addSelect([
          "task.*",
          "task.project_id as project",
          "project.name",
          "user.user_id",
          "user.username",
          "user.email",
        ])
        .where(where)
        .getOne();

      if (data) {
        data["projectDetails"] = data.project_id;
        data["userDetails"] = data.user_id;
        delete data.project_id;
        delete data.user_id;
        return { statusCode: 200, status: "success", data: data };
      } else {
        return { statusCode: 404, status: "error", message: "Not found" };
      }
    } catch (error) {
      return {
        statusCode: 500,
        status: "error",
        message: "Internal server error",
      };
    }
  }
}
