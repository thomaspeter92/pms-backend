import { Express } from "express";
import { RoleController, RolesUtil } from "./roles_controller";
import { validate } from "../../utils/validator";
import { body } from "express-validator";
import { authorize } from "../../utils/auth_util";

const validRoleInput = [
  body("name").trim().notEmpty().withMessage("required"),
  body("description").isLength({ max: 200 }).withMessage("Max 200 chars"),
  body("rights").custom((value: string) => {
    const accessRights = value.split(",");
    if (accessRights?.length > 0) {
      const validRights = RolesUtil.getAllPermissionsFromRights();
      const areAllRightsValid = accessRights.every((right) =>
        validRights.includes(right)
      );
      if (!areAllRightsValid) {
        throw new Error("Invalid permission");
      }
    }
    return true;
  }),
];

export class RolesRouter {
  private baseEndpoint = "/api/roles";

  constructor(app: Express) {
    const controller = new RoleController();

    app
      .route(this.baseEndpoint)
      .all(authorize) // Apply auth middleware before forwarding request
      .get(controller.getAllHandler)
      .post(validate(validRoleInput), controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .all(authorize) // Apply auth middleware before forwarding request
      .get(controller.getOneHandler)
      .put(validate(validRoleInput), controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
