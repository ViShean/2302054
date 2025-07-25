// tests/search.spec.js
/* eslint-env mocha */
const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const { createServer } = require("http");

chai.use(chaiHttp);

const app = require("../server");
const server = createServer(app);

before((done) => server.listen(3351, done));
after((done) => server.close(done));

describe("POST /search", () => {
  it("accepts safe input and echoes it", async () => {
    const res = await chai
      .request(server)
      .post("/search")
      .type("form")
      .send({ term: "hello world" });

    expect(res).to.have.status(200);
    expect(res.text).to.include("You searched for: hello world");
  });

  it("rejects potential XSS payloads", async () => {
    const res = await chai
      .request(server)
      .post("/search")
      .type("form")
      .send({ term: "<script>alert(1)</script>" });

    expect(res).to.have.status(200); // page reloads with error banner
    expect(res.text).to.include("⚠️ Potential XSS detected.");
  });

  it("rejects basic SQL-injection strings", async () => {
    const res = await chai
      .request(server)
      .post("/search")
      .type("form")
      .send({ term: "SELECT * FROM users;" });

    expect(res).to.have.status(200);
    expect(res.text).to.include("⚠️ Potential SQL-Injection detected.");
  });
});
