const app = require("./src/app");
const { PORT } = require("./src/config");
const { initDb } = require("./src/db/postgres");

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Rishta API running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Could not initialize database", err);
    process.exit(1);
  });
