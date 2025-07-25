/* eslint-env mocha */

import * as chai from "chai";
import { server } from "../server.js"; // We still need the server to get its address and close it

const { expect } = chai;

// Get the server address dynamically
const serverAddress = `http://127.0.0.1:3350`;

describe("GET /", () => {
  it("should return the initial search form", async () => {
    // Make the request using the built-in fetch
    const res = await fetch(serverAddress + "/");
    const html = await res.text();

    // Assert using Chai
    expect(res.status).to.equal(200);
    expect(res.headers.get("content-type")).to.include("text/html");
    expect(html).to.include('<form action="/search" method="POST">');
    expect(html).to.include('<input type="text" id="term" name="term"');
  });
});

after(() => server.close());
