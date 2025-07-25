import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import validator from "validator";

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
  if (xssRegex.test(value))
    return { ok: false, error: "Potential XSS detected." };
  if (sqliRegex.test(value))
    return { ok: false, error: "Potential SQL-Injection detected." };
  return { ok: true, safe: validator.escape(value) };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

app.post("/search", (req, res) => {
  const { term } = req.body;
  const validation = validateInput(term);

  if (!validation.ok) {
    fs.readFile(path.join(process.cwd(), "index.html"), "utf8", (err, html) => {
      if (err) return res.status(500).send("Server error");
      const modifiedHtml = html.replace(
        "<body>",
        `<body><p style="color:red;"><strong>⚠️ ${validation.error}</strong></p>`
      );
      res.send(modifiedHtml);
    });
    return;
  }

  res.send(`
    <h1>You searched for: ${validation.safe}</h1>
    <form action="/" method="GET">
      <button type="submit">Go Back</button>
    </form>
  `);
});

const server = app.listen(3350, "0.0.0.0", () =>
  console.log("Server running at http://127.0.0.1:3350")
);

export { app, server }; // ✅ Use ESM export
