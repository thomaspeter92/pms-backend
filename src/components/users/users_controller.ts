import { Request, Response } from "express";
import { UsersService } from "./users_service";
import { RolesUtil } from "../../components/roles/roles_controller";
import { bcryptCompare, encryptString, SERVER_CONST } from "../../utils/common";
import * as jwt from "jsonwebtoken";
import { hasPermission } from "../../utils/auth_util";
import { BaseController } from "../../utils/base_controller";
import { Users } from "./users_entity";
import { sendMail } from "../../utils/email_util";

export class UsersController extends BaseController {
  // Handles adding a new user to the DB
  public async addHandler(req: Request, res: Response) {
    if (!hasPermission(req.user.rights, "add_user")) {
      res
        .status(403)
        .json({ statusCode: 403, status: "error", message: "Unauthorised" });
      return;
    }
    try {
      const service = new UsersService();
      const user = req.body;

      // Check the role ids are valid
      const isValidRole = await RolesUtil.checkValidRoleIds([user.role_id]);

      // Return 400 error if invalid ids
      if (!isValidRole) {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Invalid role ids",
        });
      }

      user.email = user.email?.toLowerCase();
      user.username = user.username?.toLowerCase();

      // Encrypt the password
      user.password = await encryptString(user.password);

      // Save user to the DB
      const createdUser = await service.create(user);
      res.status(createdUser.statusCode).json(createdUser);
      return;
    } catch (error) {
      console.error(`Error while creating user`, error.message);
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
      });
    }
  }

  public async getAllHandler(req: Request, res: Response) {
    if (!hasPermission(req.user.rights, "get_all_users")) {
      res
        .status(403)
        .json({ statusCode: 403, status: "error", message: "Unauthorised" });
      return;
    }
    const service = new UsersService();
    const result = await service.findAll(req.query);
    if (result.statusCode === 200) {
      // Remove password field to send in response
      result.data.forEach((i) => delete i.password);
    }
    res.status(result.statusCode).json(result);
    return;
  }

  public async getOneHandler(req: Request, res: Response) {
    if (!hasPermission(req.user.rights, "get_details_user")) {
      res
        .status(403)
        .json({ statusCode: 403, status: "error", message: "Unauthorised" });
      return;
    }
    const service = new UsersService();
    const result = await service.findOne(req.params.id);
    if (result.statusCode === 200) {
      // Remove password field to send in response
      delete result.data.password;
    }
    res.status(result.statusCode).json(result);
    return;
  }

  /**
   * Handles the update of an EXISTING user.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   */
  public async updateHandler(req: Request, res: Response) {
    if (!hasPermission(req.user.rights, "edit_user")) {
      res
        .status(403)
        .json({ statusCode: 403, status: "error", message: "Unauthorised" });
      return;
    }
    const service = new UsersService();
    const user = req.body;

    // we will not update email and username once inserted so remove it from body
    delete user?.email;
    delete user?.username;

    // we will also not update password from here it will be from changePassword function separate
    delete user?.password;

    const result = await service.update(req.params.id, user);
    if (result.statusCode === 200) {
      delete result.data.password;
    }
    res.status(result.statusCode).json(result);
    return;
  }

  public async deleteHandler(req: Request, res: Response) {
    if (!hasPermission(req.user.rights, "delete_user")) {
      res
        .status(403)
        .json({ statusCode: 403, status: "error", message: "Unauthorised" });
      return;
    }
    const service = new UsersService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result);
    return;
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    const { oldPassword, newPassword } = req.body;

    const service = new UsersService();

    console.log(req.user);

    const dbUser = await service.findOne(req.user.user_id);

    if (dbUser.statusCode !== 200) {
      res
        .status(404)
        .send({ statusCode: 404, status: "error", message: "user not found" });
      return;
    }

    const user = dbUser.data;

    // check requested user_id and jwttoken user are the same
    if (user?.username !== req.user.username) {
      res.status(400).send({
        statusCode: 400,
        status: "error",
        message: "Not the same user",
      });
      return;
    }

    const comparePasswords = bcryptCompare(oldPassword, user.password);
    if (!comparePasswords) {
      res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Invalid password",
      });
      return;
    }

    // encrypt new password & save to user object
    user.password = await encryptString(newPassword);

    // update user
    const result = await service.update(user.user_id, user);

    if (result.statusCode === 200) {
      res.status(200).send({
        statusCode: 200,
        status: "success",
        message: "password updated",
      });
      return;
    } else {
      res.status(500).send({
        statusCode: 500,
        status: "error",
        message: "unable to update password",
      });
      return;
    }
  }

  /**
   * Login the user with the email and password. Compares provided password against hashed password in DB
   * Sends back a JWT access token and refresh token
   */
  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const service = new UsersService();

    const result = await service.findAll({ email: email });
    if (result.data.length < 1) {
      res
        .status(404)
        .json({ statusCode: 404, status: "error", message: "Email not found" });
      return;
    }
    const user = result.data[0];

    //  compare password to db hashed pw
    const comparePasswords = await bcryptCompare(password, user.password);
    if (!comparePasswords) {
      res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Invalid password",
      });
    }

    // Generate access and refresh token
    const accessToken: string = jwt.sign(
      { email: user.email, username: user.username, user_id: user.user_id },
      SERVER_CONST.JWTSECRET,
      { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS }
    );

    const refreshToken: string = jwt.sign(
      { email: user.email, username: user.username, user_id: user.user_id },
      SERVER_CONST.JWTSECRET,
      { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS }
    );

    // Respond with tokens
    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: {
        accessToken,
        refreshToken,
      },
    });
    return;
  }

  /**
   * Takes refresh token from request and generates a new accessToken with same user credentials
   * TODO: also return a new refresh token?
   */
  public async getAccessTokenFromRefreshToken(
    req: Request,
    res: Response
  ): Promise<void> {
    // Get the refresh token from the request body
    const refreshToken = req.body.refresh_token;
    // verify token
    jwt.verify(refreshToken, SERVER_CONST.JWTSECRET, (err, user) => {
      if (err) {
        // refresh token invalid, send 403
        res.status(403).json({
          statusCode: 403,
          status: "error",
          message: "Invalid refresh token",
        });
        return;
      }
      // Generate new access token
      const accessToken = jwt.sign({ user }, SERVER_CONST.JWTSECRET, {
        expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS,
      });

      // respond with new access token
      res
        .status(200)
        .json({ statusCode: 200, status: "success", data: { accessToken } });
    });
    return;
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      res
        .status(400)
        .send({ statusCode: 400, status: "error", message: "Invalid email" });
      return;
    }
    const user: Users = await UsersUtil.getUserByEmail(email);
    if (!user) {
      res
        .status(404)
        .send({ statusCode: 404, status: "error", message: "User not found" });
      return;
    }

    // Generate a reset token
    const resetToken: string = jwt.sign(
      { email: user.email },
      SERVER_CONST.JWTSECRET,
      { expiresIn: "1h" }
    );

    // Generate the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      to: email,
      subject: "Password Reset",
      html: `Hello ${user.username}, <p>To reset your password, please follow the following link: </p> <p><a href="${resetLink}"> Reset Password </p>`,
    };

    const emailStatus = await sendMail(
      mailOptions.to,
      mailOptions.subject,
      mailOptions.html
    );
    if (emailStatus) {
      res.status(200).send({
        statusCode: 200,
        status: "success",
        message: "Password reset link has been sent.",
        data: { resetToken: resetToken },
      });
    } else {
      res.status(400).send({
        statusCode: 400,
        status: "error",
        message: "Something went wrong sending password reset",
      });
    }
  }
}

export class UsersUtil {
  public static async getUserFromUsername(username: string) {
    try {
      if (username) {
        const service = new UsersService();
        const users = await service.customQuery(`username = '${username}'`);
        if (users && users.length > 0) {
          return users[0];
        }
      }
    } catch (error) {
      console.error(`Error while getUserFromToken () => ${error.message}`);
    }
    return null;
  }

  public static async getUserByEmail(email: string) {
    try {
      if (email) {
        const service = new UsersService();
        const users = await service.customQuery(`email = '${email}'`);
        if (users && users.length > 0) {
          return users[0];
        }
      }
    } catch (error) {
      console.log("Error getting user by token: ", error.message);
    }
    return null;
  }
}
