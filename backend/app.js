import { createWriteStream } from "node:fs";
import { mkdir, open, readdir, rename, rm } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

await mkdir('./storage', { recursive: true });

const mimeTypes = {
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  // console.log(req.method, req.url);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET") {
    if (req.url === "/favicon.ico") return res.end("No favicon.");
    if (req.url === "/") {
      return serveDirectory(req, res);
    }

    try {
      const [url, queryString] = req.url.split("?");
      const queryParam = {};
      queryString?.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        queryParam[key] = value;
      });

      // console.log("Query:", queryParam);

      const decodedUrl = decodeURIComponent(url);
      const fileHandle = await open(`./storage${decodedUrl}`);
      const stats = await fileHandle.stat();

      if (stats.isDirectory()) {
        return serveDirectory(req, res);
      }

      const readStream = fileHandle.createReadStream();
      res.setHeader("Content-Type", getMimeType(decodedUrl));
      res.setHeader("Content-Length", stats.size);

      if (queryParam.action === "download") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${path.basename(decodedUrl)}"`
        );
      }

      readStream.pipe(res);

    } catch (err) {
      // console.error(err.message);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found!");
    }

  } else if (req.method === "POST") {
    const filename = req.headers.filename;
    if (!filename) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Missing filename header");
    }

    const writeStream = createWriteStream(`./storage/${filename}`);
    req.pipe(writeStream);

    req.on("end", () => {
      res.end("File uploaded to server");
    });

  } else if (req.method === "DELETE") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const { filename } = JSON.parse(body);
        if (!filename) throw new Error("Missing filename");
        await rm(`./storage/${filename}`);
        res.end("File deleted successfully");
      } catch (err) {
        // console.error(err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });

  } else if (req.method === "PATCH") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (!data.oldFilename || !data.newFilename) {
          throw new Error("Missing filenames for rename");
        }
        await rename(
          `./storage/${data.oldFilename}`,
          `./storage/${data.newFilename}`
        );
        res.end("File renamed successfully");
      } catch (err) {
        // console.error(err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

async function serveDirectory(req, res) {
  try {
    const [url] = req.url.split("?");
    const itemsList = await readdir(`./storage${decodeURIComponent(url)}`);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(itemsList));
  } catch (err) {
    // console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

server.listen(80, "0.0.0.0", () => {
  console.log("Server started on port 80");
});
