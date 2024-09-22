import { Express } from "express";
import { UsersController } from "./users_controller";
import { validate } from "../../utils/validator";
import { body } from "express-validator";

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

export class UsersRouter {
  private baseEndpoint = "/api/users";

  constructor(app: Express) {
    const controller = new UsersController();

    app
      .route(this.baseEndpoint)
      .get(controller.getAllHandler)
      .post(validate(validUserInput), controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .get(controller.getDetailsHandler)
      .put(controller.updateHandler)
      .delete(controller.deleteHandler);

    app.route("/api/login").post(controller.login);

    app
      .route("/api/refresh_token")
      .post(controller.getAccessTokenFromRefreshToken);
  }
}
