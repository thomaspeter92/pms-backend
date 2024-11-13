import chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

import { describe, it } from "mocha";
import { app } from "../common/utility.spec";

const expect = chai.expect;
let authToken: string;
let userId: string;

describe("Login API", () => {
  it("Should return a success message when login is successful", (done) => {
    chai
      .request(app)
      .post("/api/login")
      .send({
        email: process.env.DEFAULT_USER_EMAIL,
        password: process.env.DEFAULT_USER_PASSWORD,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("status").equal("success");
        authToken = res.body.data.accessToken;
        done();
      });
  });

  it("should return an error when login fails", (done) => {
    chai
      .request(app)
      .post("/api/login")
      .send({ email: "deafult_user@pms.com", password: "wrongPassword" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").equal("Invalid password");
        done();
      });
  });
});

describe("GET list of users", () => {
  it("should return an array of users with status code 200", (done) => {
    chai
      .request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${authToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data").to.be.an("array");
        done();
      });
  });
});

describe("ADD User", () => {
  it("should return with status code 201", (done) => {
    chai
      .request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${authToken}`) // Pass the token in the headers
      .send({
        full_name: "Super Admin",
        username: "pms-admin1",
        email: "admin@pms1.com",
        password: "Admin@pms1",
        role_id: "21005ceb-3db7-4601-bc28-d7c97e520dca",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        userId = res.body.data.user_id;
        done();
      });
  });
  it("should return with status code 409", (done) => {
    chai
      .request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${authToken}`) // Pass the token in the headers
      .send({
        full_name: "Super Admin",
        username: "pms-admin1",
        email: "admin@pms1.com",
        password: "Admin@pms1",
        role_id: "21005ceb-3db7-4601-bc28-d7c97e520dca",
      })
      .end((err, res) => {
        expect(res).to.have.status(409);
        expect(res.body)
          .to.have.property("message")
          .equal("Key (username)=(pms-admin1) already exists.");
        done();
      });
  });
});

describe("Delete User", () => {
  it("should retun status code 200 and delete user", (done) => {
    chai
      .request(app)
      .delete("/api/users/" + userId)
      .set("Authorization", `Bearer ${authToken}`) // Pass the token in the headers
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
