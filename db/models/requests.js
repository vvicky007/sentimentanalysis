const mongoose = require("../mongoose");
const validator = require("validator");
const User = require("./users");
const requestSchema = mongoose.Schema({
  raisedBy: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  raisedFor: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
});
requestSchema.statics.findReq = async (reqId) => {
  const request = await Request.findOne({ _id: reqId });
  return request;
};
requestSchema.pre("save", async function (next) {
  const admin = this;
  admin.type = admin.type.toUpperCase();
  next();
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
