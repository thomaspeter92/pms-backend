import { ExpressServer } from "./express_server";
import cluster from "cluster";
import os from "os";
import { DatabaseUtil } from "./utils/db";
import { DDLUtil } from "./utils/ddl_util";
import { CacheUtil } from "./utils/cache_util";
import { UsersUtil } from "./components/users/users_controller";
require("dotenv").config();

const numCPUs = os.cpus().length;
const args = process.argv.slice(2);

if (cluster.isPrimary) {
  console.log(`Master process PID: ${process.pid}`);
  if (args.length > 0 && args[0] === "--init") {
    (async () => {
      await DatabaseUtil.getInstance();
      await DDLUtil.addDefaultRole();
      await DDLUtil.addDefaultUser();
      process.exit();
    })();
  } else {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
      console.log(
        `Worker process ${worker.process.pid} exited with code ${code} and signal ${signal}`
      );
      setTimeout(() => {
        cluster.fork();
      }, 1000);
    });
  }
} else {
  const server = new ExpressServer();

  // init database util
  new DatabaseUtil();

  // init cache util
  new CacheUtil();

  setTimeout(() => {
    UsersUtil.putAllUsersInCache();
  }, 1000 * 10);

  process.on("uncaughtException", (error: Error) => {
    console.error(
      `Uncaught exception in worker process ${process.pid}:`,
      error
    );

    // close any open connections or resources
    server.closeServer();

    setTimeout(() => {
      cluster.fork();
      cluster.worker.disconnect();
    }, 1000);
  });

  // Gracefully handle termination signals
  process.on("SIGINT", () => {
    console.log("Received SIGINT signal");
    // close any open connections or resources
    server.closeServer();
  });

  // Gracefully handle termination signals
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM signal");
    // close any open connections or resources
    server.closeServer();
  });
}
