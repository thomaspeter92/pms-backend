import { DatabaseUtil } from "../../utils/db";
import { ExpressServer } from "../../express_server";
import { before, after } from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

let app, expressServer;

before(async () => {
  const databaseUtil = new DatabaseUtil();
  await databaseUtil.dbConnect();
  expressServer = new ExpressServer();
  app = expressServer.app;
});
// Close the server after all tests are done
after(function (done) {
  expressServer.closeServer(done);
});

export { app };
