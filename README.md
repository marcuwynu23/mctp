# 📝 MCTP — Markdown Content Transfer Protocol

**MCTP (Markdown Content Transfer Protocol)** is a lightweight TCP-based protocol designed for serving and retrieving Markdown content over simple socket connections — without the overhead of HTTP.

It allows developers to quickly host `.md` files and fetch them using a minimal request/response format, making it ideal for lightweight documentation systems, local dev servers, or embedded tools.

---

## 🚀 Features

- 🔌 Pure **TCP socket** implementation (no HTTP server required)
- 🗂️ Serves Markdown files directly from a folder
- ⚙️ Configurable **routes**, **host**, **port**, and **content directory**
- 📡 Simple, human-readable request format
- 🧠 Lightweight and dependency-free (only Node.js built-ins)
- 💡 Extendable for custom content types or commands

---

## 📦 Installation

Clone or download this repository, then install dependencies (none required beyond Node.js):

```bash
git clone git@github.com:marcuwynu23/mctp.git
cd mctp
```

MCTP works with **Node.js v16+**.

---

## ⚙️ Usage

### 1. Start the Server

```js
// server.js
const {MCTPServer} = require("./lib");

const server = new MCTPServer({
  host: "127.0.0.1",
  port: 9196,
  contentDir: "./content",
  routes: {
    "/": "index.md",
    "/hello": "hello.md",
  },
});

server.listen();
```

Run it:

```bash
node server.js
```

📢 Output:

```
MCTP Server listening on 127.0.0.1:9196
```

---

### 2. Connect Using the Client

```js
// client.js
const {MCTPClient} = require("./lib");

(async () => {
  const client = new MCTPClient({host: "127.0.0.1", port: 9196});
  const response = await client.get("/hello");

  console.log("Status:", response.status);
  console.log("Headers:", response.headers);
  console.log("Body:\n", response.body);
})();
```

Run:

```bash
node client.js
```

🧾 Example Output:

```
Status: 200 OK
Headers: {
  'Content-Type': 'text/markdown',
  'Content-Length': '42'
}

Body:
# Hello World
Welcome to the MCTP server!
```

---

## 📡 Protocol Specification

### Request Format

A client sends a single line followed by two newlines:

```
Request: GET /hello

```

### Response Format

Server responds with headers + Markdown body:

```
MCTP/1.0
Status: 200 OK
Content-Type: text/markdown
Content-Length: 42

# Hello World
This is a markdown file.
```

If the file is not found:

```
MCTP/1.0
Status: 404 Not Found
Content-Type: text/plain
Content-Length: 9

Not Found
```

---

## 🔧 Configuration Options

| Option       | Type     | Default         | Description                              |
| ------------ | -------- | --------------- | ---------------------------------------- |
| `host`       | `string` | `'127.0.0.1'`   | IP address to bind to                    |
| `port`       | `number` | `9196`          | TCP port to listen on                    |
| `contentDir` | `string` | `process.cwd()` | Root directory of markdown files         |
| `routes`     | `Object` | `{}`            | Map of route paths to markdown filenames |

---

## 🧩 Extending MCTP

You can easily extend this protocol for:

- Supporting other file formats (e.g. `.json`, `.html`)
- Adding authentication headers
- Supporting new commands (`POST`, `PING`, etc.)
- Integrating with file watchers to auto-reload content

Example (add support for `.json`):

```js
if (requestedPath.endsWith(".json")) {
  responseHeaders["Content-Type"] = "application/json";
}
```

---

## 🧪 Example Routes

```js
routes: {
  "/": "index.md",
  "/about": "about.md",
  "/docs/getting-started": "docs/getting-started.md",
}
```

---

## 🧮 Future Plans

- [ ] Add Markdown-to-HTML live preview option
- [ ] Add WebSocket bridge for live documentation updates
- [ ] Add CLI command (`mctp serve ./docs`)
- [ ] Add `.mctp` config file for easier setup

---

## 👨‍💻 Author

Developed by **[Mark Wayne B. Menorca]**
📧 [innovations@marcuwynu.space](mailto:innovations@marcuwynu.space)
🌐 [https://github.com/marcuwynu23](https://github.com/marcuwynu23)

---

## 📜 License

MIT License © 2025 — Open-source and free to modify.

---

> 💡 _MCTP_ is a lightweight experiment for learning and sharing — think of it as **HTTP’s tiny Markdown cousin.**
