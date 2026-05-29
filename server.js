const http = require("http");
const fs = require("fs");
const path = require("path");
const dataHandler = require("./api/data");
const uploadHandler = require("./api/upload");

const publicDir = path.join(__dirname, "public");
const port = process.env.PORT || 3000;

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };
  if (req.url.startsWith("/api/data")) return dataHandler(req, res);
  if (req.url.startsWith("/api/upload")) return uploadHandler(req, res);
  if (req.url === "/admin") return sendFile(res, path.join(publicDir, "admin.html"));
  if (req.url === "/") return sendFile(res, path.join(publicDir, "index.html"));
  return sendFile(res, path.join(publicDir, decodeURIComponent(req.url.split("?")[0])));
});

server.listen(port, () => {
  console.log(`BI de produtividade em http://localhost:${port}`);
});
