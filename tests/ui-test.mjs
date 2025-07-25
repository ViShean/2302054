/* eslint-env mocha */

import * as chai from "chai";
import { server } from "../server.js";

const { expect } = chai;
const serverAddress = `http://127.0.0.1:3350`;

describe("GET /", () => {
  it("should return the initial search form", async () => {
    const res = await fetch(serverAddress + "/");
    const html = await res.text();

    // --- ADD THIS LINE FOR DEBUGGING ---
    console.log("--- SERVER RESPONSE ---");
    console.log(html);
    console.log("--- END SERVER RESPONSE ---");

    // Assert using Chai
    expect(res.status).to.equal(200);
    expect(html).to.include('<form action="/search" method="POST">');
    expect(html).to.include('<input type="text" id="term" name="term"');
  });
});

after(() => server.close());
