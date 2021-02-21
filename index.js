const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const config = require("./config");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const userRouter = require("./routes/users")();
const adminRouter = require("./routes/admin")();
const superadminRouter = require("./routes/superadmin")();
app.use("/users", userRouter);
app.use("/admin", adminRouter);
app.use("/superadmin", superadminRouter);
app.get("/", (req, res) => {
  res.send("hello world");
});
app.listen(process.env.PORT || config.port, () => {
  console.info("running on " + config.port);
});
