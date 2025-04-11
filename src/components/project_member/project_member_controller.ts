import { Rights } from "../../utils/common";
import { hasPermission } from "../../utils/auth_util";
import { Request, Response } from "express";
import { ProjectMemberService } from "./project_member_service";
import { UsersUtil } from "../../components/users/users_controller";

export class ProjectMemberController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, Rights.PROJECTS.EDIT)) {
      res
        .status(403)
        .send({ statusCode: 403, status: "error", message: "Unauthorised" });
      return;
    }
    try {
      const service = new ProjectMemberService();

      const new_member = req.body;

      const userValid = await UsersUtil.checkValidUserIds([new_member.user_id]);

      // Check user isnt already on this project
      const existing = await service.customQuery(
        `user_id =  :userId AND project_id = :projectId`,
        { userId: new_member.user_id, projectId: new_member.project_id }
      );

      if (!userValid || existing?.length > 0) {
        res.status(400).send({
          statusCode: 400,
          status: "error",
          message: "invalid user_id or user is already on this project",
        });
        return;
      }

      const result = await service.create({
        user: new_member.user_id,
        project: new_member.project_id,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
      });
    }
  }

  public async getAllHander(req: Request, res: Response) {
    const service = new ProjectMemberService();

    const query = req.query;

    const results = await service.findAll(query);

    res.status(results.statusCode).json(results);
  }
}
