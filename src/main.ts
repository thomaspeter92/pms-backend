import { ExpressServer } from "./express_server";
import cluster from "cluster";
import { DatabaseUtil } from "./utils/db";

// connect to server
const server = new ExpressServer();

// connect to the DB
new DatabaseUtil();

process.on("uncaughtException", (error: Error) => {
  console.error(`Uncaught exception in worker process ${process.pid}:`, error);

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
