import { ApiResponse, BaseService } from "../../utils/base_service";
import { Repository } from "typeorm";
import { DatabaseUtil } from "../../utils/db";
import { ProjectMember } from "./project_member_entity";

export class ProjectMemberService extends BaseService<ProjectMember> {
  private projectMemberRepository: Repository<ProjectMember> | null = null;
  constructor() {
    const databaseUtil = new DatabaseUtil();

    let projectMemberRepository = databaseUtil.getRepository(ProjectMember);
    super(projectMemberRepository);
    this.projectMemberRepository = projectMemberRepository;
  }

  override async findAll(
    queryParams: object
  ): Promise<ApiResponse<ProjectMember[]>> {
    try {
      console.log("hello");

      const queryBuilder =
        this.projectMemberRepository.createQueryBuilder("member");

      if (queryParams["user_id"]) {
        queryBuilder
          .leftJoin("member.project", "project")
          .addSelect(["member.*", "project.project_id", "project.name"]);
      } else if (queryParams["project_id"]) {
        queryBuilder
          .leftJoin("member.user", "user")
          .addSelect(["member.*", "user.full_name"]);
      }

      console.log(queryParams);

      const data = await queryBuilder.getMany();

      console.log(data);

      return { status: "success", statusCode: 200, data: data };
    } catch (error) {
      console.log(error);
      return {
        status: "error",
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }
}
