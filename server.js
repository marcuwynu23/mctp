const path = require("path");
const {MCTPServer} = require("./lib");

const contentDir = path.join(__dirname, "content");

const routes = {
  "/": "index.md",
  "/hello": "hello.md",
  // add more routes as needed
};

const server = new MCTPServer({
  host: "127.0.0.1",
  port: 9196,
  contentDir,
  routes,
});

server
  .listen()
  .then(() => {
    console.log("Server started with custom routes");
  })
  .catch(console.error);
