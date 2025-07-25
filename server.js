const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const validator = require("validator");

const xssRegex = /<[^>]+>|(&#x?[0-9a-f]+;)/i;
const sqliRegex =
  /\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|--|;|\/\*|\*\/)\b/i;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

function validateInput(raw) {
  const value = validator.trim(raw || "");

  if (value.length === 0 || value.length > 100) {
    return { ok: false, error: "Input length invalid." };
  }

  if (xssRegex.test(value)) {
    return { ok: false, error: "Potential XSS detected." };
  }

  if (sqliRegex.test(value)) {
    return { ok: false, error: "Potential SQL-Injection detected." };
  }

  return { ok: true, safe: validator.escape(value) };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/search", (req, res) => {
  const { term } = req.body;
  const validation = validateInput(term);

  if (!validation.ok) {
    // Reload index.html but show error above the form
    fs.readFile(path.join(__dirname, "index.html"), "utf8", (err, html) => {
      if (err) return res.status(500).send("Server error");
      const modifiedHtml = html.replace(
        "<body>",
        `<body>
           <p style="color:red;"><strong>⚠️ ${validation.error}</strong></p>`
      );
      res.send(modifiedHtml); // Reload page with cleared input
    });
    return;
  }

  // Valid input → Show result page
  res.send(`
    <h1>You searched for: ${validation.safe}</h1>
    <form action="/" method="GET">
      <button type="submit">Go Back</button>
    </form>
  `);
});

app.listen(3350, "0.0.0.0", () =>
  console.log("Server running at http://127.0.0.1:3350")
);
module.exports = { validateInput, server };
