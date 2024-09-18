import { DataSource } from "typeorm";
import { IServerConfig } from "./config";
import * as config from "../../server_config.json";

export class DatabaseUtil {
  public server_config: IServerConfig = config;

  constructor() {
    this.dbConnect();
  }

  private dbConnect() {
    try {
      const db_config = this.server_config.db_config;
      const AppDataSource = new DataSource({
        type: "postgres",
        host: db_config.host,
        port: db_config.port,
        username: db_config.username,
        password: db_config.password,
        database: db_config.dbname,
        entities: [],
        synchronize: true,
        logging: false,
      });
    } catch (error) {}
  }
}
