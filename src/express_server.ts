import express, { Express } from "express";
import { IServerConfig } from "./utils/config";
import * as config from "../server_config.json";
import { AppRouter } from "./routes/index";
import bodyParser from "body-parser";

export class ExpressServer {
  private static server = null;
  public server_config: IServerConfig = config;
  public app: Express;

  constructor() {
    const port = this.server_config.port ?? 3000;
    // initialise express app
    this.app = express();

    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    this.app.get("/ping", (req, res) => {
      res.send("pong");
    });

    const router = new AppRouter(this.app);
    if (router) {
      console.log("Router connected!");
    }

    ExpressServer.server = this.app.listen(port, () => {
      console.log(
        `Server is running on port ${port} with pid = ${process.pid}`
      );
    });
  }

  // close the server for safe on uncaughtException
  public closeServer(): void {
    ExpressServer.server.close(() => {
      console.log("server closed");
      process.exit(0);
    });
  }
}
