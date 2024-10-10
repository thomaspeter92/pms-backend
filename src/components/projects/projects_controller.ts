import { Response, Request } from "express";
import { hasPermission } from "../../utils/auth_util";
import { ProjectsService } from "./projects_service";
import { UsersUtil } from "../users/users_controller";

export class ProjectsController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, "add_project")) {
      res
        .status(403)
        .send({ statusCode: 403, status: "error", message: "Unathorised" });
      return;
    }
    try {
      const service = new ProjectsService();

      const project = req.body;

      const usersValid = await UsersUtil.checkValidUserIds(project.user_ids);

      if (!usersValid) {
        res.status(400).send({
          statusCode: 400,
          status: "error",
          message: "invalid user_ids",
        });
      }

      const createdProject = await service.create(project);
      res.status(200).json(createdProject);
    } catch (error) {
      console.log();
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
      });
    }
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, "get_all_projects")) {
      res.status(403).json({
        statusCode: 403,
        status: "error",
        message: "Unauthorised",
      });
      return;
    }
    const service = new ProjectsService();
    const result = await service.findAll(req.query);
    for (const project of result.data) {
      project["users"] = await UsersUtil.getUsernamesById(project.user_ids);
      delete project.user_ids;
    }

    res.status(result.statusCode).json(result);
    return;
  }

  public async getDetailsHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, "get_details_project")) {
      res.status(403).json({
        statusCode: 403,
        status: "error",
        message: "Unauthorised",
      });
    }

    const service = new ProjectsService();
    const result = await service.findOne(req.params.project_id);
    result.data["users"] = await UsersUtil.getUsernamesById(
      result.data.user_ids
    );
    delete result.data.user_ids;
    res.status(result.statusCode).send(result);
    return;
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    return;
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    return;
  }
}
