/* eslint-env mocha */

import * as chai from "chai";
import chaiHttp from "chai-http";
import { server } from "../server.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("GET /", () => {
  it("should return the initial search form", async () => {
    const res = await chai.request(server).get("/");

    expect(res).to.have.status(200);
    expect(res).to.be.html; // Check if the response is HTML
    expect(res.text).to.include('<form action="/search" method="POST">');
    expect(res.text).to.include('<input type="text" id="term" name="term"');
    expect(res.text).to.include('<button type="submit">Submit</button>');
  });
});

after(() => server.close());
