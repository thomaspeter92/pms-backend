import { hasPermission } from "../../utils/auth_util";
import { Request, Response } from "express";
import { CommentsService } from "./comments_service";
import { TasksUtil } from "../tasks/tasks_controller";

export class CommentsController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req?.user?.rights, "add_task")) {
      res
        .status(403)
        .send({ statusCode: 403, status: "error", message: "Unauthorised" });
    }

    try {
      let service = new CommentsService();
      const comment = req.body;

      const task = await TasksUtil.getTaskById(comment.task_id);
      const isValidTask = task ? true : false;

      if (!isValidTask) {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "invalid task ID",
        });
        return;
      }

      comment["user_id"] = req.user.user_id;

      const result = await service.create(comment);
      res.status(200).json(result);
    } catch (error) {
      console.log("Error while creating new comment", error.message);
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
      });
    }
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    const service = new CommentsService();
    const result = await service.findAll(req.query);

    res.status(200).json(result);
  }

  public async getDetailsHandler() {}

  public async updateHandler() {}

  public async deleteHandler() {}
}
