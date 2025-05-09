import { Roles } from "../components/roles/roles_entity";
import { RolesUtil } from "../components/roles/roles_controller";
import { v4 } from "uuid";
import { RolesService } from "../components/roles/roles_service";
import { UsersService } from "../components/users/users_service";
import { Users } from "../components/users/users_entity";
import * as config from "../../server_config.json";
import { encryptString, Rights } from "./common";

export class DDLUtil {
  private static superAdminRoleId: string;

  public static async addDefaultRole(): Promise<boolean> {
    try {
      const service = new RolesService();
      const rights = RolesUtil.getAllPermissionsFromRights();
      const role: Roles = {
        role_id: v4(),
        name: "SuperAdmin",
        description: "Admin with having all permission",
        rights: rights.join(","),
        created_at: new Date(),
        updated_at: new Date(),
      };
      const userRole: Roles = {
        role_id: v4(),
        name: "User",
        description: "Has basic rights",
        created_at: new Date(),
        updated_at: new Date(),
        rights: [
          Rights.PROJECTS.GET_ALL,
          Rights.PROJECTS.GET_DETAILS,
          Rights.TASKS.ALL,
          Rights.COMMENTS.ALL,
          Rights.USERS.GET_ALL,
        ].join(),
      };
      const result = await service.create(role);
      const result2 = await service.create(userRole);
      console.log("Add Default Role Result", result);
      if (result.statusCode === 201 && result2.statusCode === 201) {
        this.superAdminRoleId = result.data.role_id;
        return true;
      } else if (result.statusCode === 409) {
        const roles = await service.findAll({ name: "SuperAdmin" });
        if (roles.data.length > 0) {
          this.superAdminRoleId = roles.data[0].role_id;
        }
      }
      return false;
    } catch (error) {
      console.error(`Error while addDefaultRole() => ${error.message}`);
      return false;
    }
  }
  public static async addDefaultUser(): Promise<boolean> {
    try {
      const service = new UsersService();

      const user: Users = {
        user_id: v4(),
        full_name: "Super Admin",
        username: "superadmin",
        email: process.env.DEFAULT_USER_EMAIL,
        password: await encryptString(process.env.DEFAULT_USER_PASSWORD),
        role_id: this.superAdminRoleId,
        created_at: new Date(),
        updated_at: new Date(),
        projects: [],
      };
      const result = await service.create(user);
      console.log("Add Default User Result", result);
      if (result.statusCode === 201) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error while addDefaultRole() => ${error.message}`);
      return false;
    }
  }
}
