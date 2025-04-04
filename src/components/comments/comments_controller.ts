import { hasPermission } from "../../utils/auth_util";
import { Request, Response } from "express";

export class CommentsController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req?.user?.rights, "add_task")) {
      res
        .status(403)
        .send({ statusCode: 403, status: "error", message: "Unauthorised" });
    }
  }

  public getAllHandler() {}

  public getDetailsHandler() {}

  public async updateHandler() {}

  public async deleteHandler() {}
}
