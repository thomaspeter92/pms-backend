import { Request, Response } from "express";
import { UsersService } from "./users_service";
import { RolesUtil } from "../../components/roles/roles_controller";
import { bcryptCompare, encryptString, SERVER_CONST } from "../../utils/common";
import * as jwt from "jsonwebtoken";

export class UsersController {
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
      { email: user.email, username: user.username },
      SERVER_CONST.JWTSECRET,
      { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS }
    );

    const refreshToken: string = jwt.sign(
      { email: user.email, username: user.username },
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

  public async getAccessTokenFromRefreshToken(
    req: Request,
    res: Response
  ): Promise<void> {
    // Get the refresh tojen from the request body
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

  // Handles adding a new user to the DB
  public async addHandler(req: Request, res: Response) {
    // if (!hasPermission(req.user.rights, 'add_user')) {
    //   res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorised' });
    //   return;
    // }

    try {
      const service = new UsersService();

      const user = req.body;

      console.log(user);
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

  public getAllHandler() {}

  public getDetailsHandler() {}

  public async updateHandler() {}

  public async deleteHandler() {}
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
}
