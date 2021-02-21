const url = `mongodb+srv://vineeth:123mongo@cluster0.kwlut.mongodb.net/OslashHiring?retryWrites=true&w=majority`;
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
