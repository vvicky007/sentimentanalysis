const url = `mongodb://127.0.0.1:27017/users`;
const mongoose = require("mongoose");
mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});
module.exports = mongoose;
