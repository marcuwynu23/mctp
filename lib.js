const net = require("net");
const fs = require("fs");
const path = require("path");

class MCTPServer {
  /**
   * @param {Object} options
   * @param {string} [options.host='127.0.0.1']
   * @param {number} [options.port=9090]
   * @param {string} [options.contentDir=process.cwd()]
   * @param {Object} [options.routes] - Optional route-to-file map, e.g. {"/": "index.md", "/hello": "hello.md"}
   */
  constructor({
    host = "127.0.0.1",
    port = 9090,
    contentDir = process.cwd(),
    routes = {},
  } = {}) {
    this.host = host;
    this.port = port;
    this.contentDir = contentDir;
    this.routes = routes;
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  handleConnection(socket) {
    console.log("Client connected:", socket.remoteAddress);

    socket.on("data", (data) => {
      const request = data.toString();
      console.log("Request received:\n", request);

      const lines = request.split("\n");
      let requestedPath = "/"; // default route is "/"
      for (const line of lines) {
        if (line.startsWith("Request: GET ")) {
          requestedPath = line.replace("Request: GET ", "").trim();
        }
      }

      // Map requested route to markdown file via routes config
      let mdFile = this.routes[requestedPath];
      if (!mdFile) {
        // fallback: if no explicit route, try to resolve path directly
        mdFile = requestedPath;
      }

      // Normalize to .md extension
      if (!mdFile.endsWith(".md")) {
        mdFile += ".md";
      }

      // Full filesystem path
      const filePath = path.join(this.contentDir, mdFile);

      fs.readFile(filePath, "utf8", (err, content) => {
        if (err) {
          const notFoundResponse = [
            "MCTP/1.0",
            "Status: 404 Not Found",
            "Content-Type: text/plain",
            "Content-Length: 9",
            "",
            "Not Found",
          ].join("\n");
          socket.write(notFoundResponse);
        } else {
          const responseHeaders = [
            "MCTP/1.0",
            "Status: 200 OK",
            "Content-Type: text/markdown",
            `Content-Length: ${Buffer.byteLength(content, "utf8")}`,
            "",
            "",
          ].join("\n");
          socket.write(responseHeaders + content);
        }
        socket.end();
      });
    });

    socket.on("end", () => {
      console.log("Client disconnected");
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });
  }

  listen() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, this.host, () => {
        console.log(`MCTP Server listening on ${this.host}:${this.port}`);
        resolve();
      });
      this.server.on("error", (err) => reject(err));
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

class MCTPClient {
  /**
   * @param {Object} options
   * @param {string} [options.host='127.0.0.1']
   * @param {number} [options.port=9090]
   * @param {number} [options.timeout=5000] - connection timeout in ms
   */
  constructor({host = "127.0.0.1", port = 9090, timeout = 5000} = {}) {
    this.host = host;
    this.port = port;
    this.timeout = timeout;
  }

  /**
   * Send a GET request to the MCTP server
   * @param {string} path - route path, e.g. "/" or "/hello"
   * @returns {Promise<{status: string, headers: Object, body: string}>}
   */
  async get(path = "/") {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let responseData = "";

      socket.setTimeout(this.timeout, () => {
        socket.destroy();
        reject(new Error("Connection timed out"));
      });

      socket.connect(this.port, this.host, () => {
        const request = `Request: GET ${path}\n\n`;
        socket.write(request);
      });

      socket.on("data", (chunk) => {
        responseData += chunk.toString();
      });

      socket.on("end", () => {
        try {
          const [headerSection, body = ""] = responseData.split("\n\n");
          const headerLines = headerSection.split("\n").filter(Boolean);

          const headers = {};
          let status = "Unknown";

          for (const line of headerLines) {
            if (line.startsWith("Status: ")) {
              status = line.replace("Status: ", "").trim();
            } else if (line.includes(":")) {
              const [key, value] = line.split(":").map((s) => s.trim());
              headers[key] = value;
            }
          }

          resolve({status, headers, body});
        } catch (err) {
          reject(new Error("Failed to parse MCTP response: " + err.message));
        }
      });

      socket.on("error", (err) => {
        reject(err);
      });
    });
  }
}

module.exports = {MCTPClient, MCTPServer};
