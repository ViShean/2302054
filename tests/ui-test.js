/* eslint-env mocha */

import * as chai from "chai"; // namespace import –> gives us chai.request(..)
import { expect } from "chai"; // named import –> clean “expect(…)” syntax
import chaiHttp from "chai-http";

import { server } from "../server.js"; // server.js must `export { app, server }`

// plug chai-http into chai
chai.use(chaiHttp);

describe("POST /search", () => {
  it("accepts safe input and echoes it", async () => {
    const res = await chai
      .request(server) // hit the already-running server
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

/* --------------------------------------------------------------- */
/*  tidy-up                                                        */
/* --------------------------------------------------------------- */
after(() => {
  server.close(); // shut down the listener started in server.js
});
