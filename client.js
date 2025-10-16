const {MCTPClient} = require("./lib");

(async () => {
  const client = new MCTPClient({host: "127.0.0.1", port: 9196});

  try {
    const res = await client.get("/hello");
    console.log("Status:", res.status);
    console.log("Headers:", res.headers);
    console.log("Body:\n", res.body);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
