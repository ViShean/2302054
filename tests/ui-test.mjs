// tests/ui-test.mjs
/* eslint-env mocha */

import chai from "chai"; // default export now exists (CommonJS pkg)
import chaiHttp from "chai-http";
import { server } from "../server.js"; // server.js exports { app, server }

chai.use(chaiHttp); // patches chai with .request()
const { expect } = chai;

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

    expect(res).to.have.status(200);
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

after(() => server.close());
