import { BaseController } from "../../utils/base_controller";
import { Rights } from "../../utils/common";
import { Roles } from "./roles_entity";
import { RolesService } from "./roles_service";
import { Response, Request, query } from "express";

export class RoleController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    const role = req.body;
    const service = new RolesService();
    const result = await service.create(role);
    res.status(result.statusCode).json(result);
    return;
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
    return;
  }

  public async getOneHandler(req: Request, res: Response): Promise<void> {
    const service = new RolesService();
    const result = await service.findOne(req.params.id);
    res.status(result.statusCode).json(result);
    return;
  }

  public getDetailsHandler() {}

  public async updateHandler(req: Request, res: Response): Promise<void> {
    const role = req.body;
    const service = new RolesService();
    const result = await service.update(req.params.id, role);
    res.status(result.statusCode).json(result);
    return;
  }

  public async deleteHandler(req: Request, res: Response) {
    const service = new RolesService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result);
  }
}

export class RolesUtil {
  /**
   * Retrieves all possible permissions from the defined rights in the Rights object
   * @returns {string[]} an array of permissions
   */
  public static getAllPermissionsFromRights(): string[] {
    // Init an empty array to collect vals
    let permissions = [];

    // Iterate through each section of the rights object
    for (const module in Rights) {
      // check if rights for ALL are defined for current module
      if (Rights[module]["ALL"]) {
        let sectionValues = Rights[module]["ALL"];
        sectionValues = sectionValues.split(",");
        permissions = [...permissions, ...sectionValues];
      }
    }
    return permissions;
  }

  public static async checkValidRoleIds(role_ids: string[]) {
    const rolesService = new RolesService();

    // Query the db, check if all role ids are valid
    const roles = await rolesService.findByIds(role_ids);
    console.log(roles);

    // Check if all the role_ids are found in the db
    return roles.data.length === role_ids.length;
  }

  public static async getAllRightsFromRoles(
    role_ids: string[]
  ): Promise<string[]> {
    // create an instance of RolesService to interact with roles
    const service = new RolesService();

    // init array to store rights
    let rights: string[] = [];

    // validate provided role ids with DB
    const queryData = await service.findByIds(role_ids);
    const roles: Roles[] = queryData.data ? queryData.data : [];

    // extract rights from each role, add to array
    roles.forEach((role) => {
      const rightFromRole: string[] = role.rights.split(",");
      rights = [...new Set(rights.concat(rightFromRole))];
    });

    // return accumulated rights
    return rights;
  }
}
