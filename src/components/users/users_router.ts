import { Express } from "express";
import { UsersController } from "./users_controller";
import { validate } from "../../utils/validator";
import { body } from "express-validator";
import { authorize } from "../../utils/auth_util";

const validUserInput = [
  body("full_name").trim().notEmpty().withMessage("fullname required"),
  body("username").trim().notEmpty().withMessage("Username required"),
  body("email").isEmail().withMessage("It should be valid emailId"),
  body("password")
    .isLength({ min: 6, max: 12 })
    .withMessage("It must be between 6 and 12 characters in length")
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(
      "It should include at least one uppercase letter, one lowercase letter, one special symbol, and one numerical digit."
    ),
  body("role_id").isUUID().withMessage("It must be uuid of role"),
];

const updateValidUserInput = [
  body("role_ids")
    .isArray()
    .withMessage("It must be an array of uuids of roles")
    .custom((value: string[]) => {
      if (value?.length > 0 && value instanceof Array) {
        const uuidPattern =
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const isValid = value?.every((uuid) => uuidPattern.test(uuid.trim()));
        if (!isValid) {
          throw new Error("It has invalid uuids for role");
        }
      }
      return true; // Validation passed
    }),
];

const validNewPassword = [
  body("oldPassword").trim().notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .trim()
    .isLength({ min: 6, max: 12 })
    .withMessage("Password must be between 6-12 characters")
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(
      "Password should contain at least one uppercase & lowercase letter, one special character and one number."
    ),
  body("role_ids"),
];

export class UsersRouter {
  private baseEndpoint = "/api/users";

  constructor(app: Express) {
    const controller = new UsersController();

    app
      .route(this.baseEndpoint)
      .all(authorize) // Apply auth middleware before forwarding request
      .get(controller.getAllHandler)
      .post(validate(validUserInput), controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .all(authorize) // Apply auth middleware before forwarding request
      .get(controller.getOneHandler)
      .put(validate(updateValidUserInput), controller.updateHandler)
      .delete(controller.deleteHandler);

    app.route("/api/login").post(controller.login);

    app
      .route("/api/refresh_token")
      .post(controller.getAccessTokenFromRefreshToken);

    app
      .route(this.baseEndpoint + "/changePassword")
      .all(authorize)
      .post(validate(validNewPassword), controller.changePassword);

    app.route("/api/forgotPassword").post(controller.forgotPassword);
  }
}
