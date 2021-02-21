const User = require("../db/models/users");
const axios = require("axios");
const Request = require("../db/models/requests");
const { SERVERERROR, UNAUTHORIZED, NOTFOUND } = require("../constants");
exports.permissions = async (req, res, next) => {
  if (req.admin) {
    const { reqId, email } = req.body;
    try {
      const request = await Request.findReq({ _id: reqId });
      if (request) {
        req.permissions = request.status;
        if (
          request.raisedFor === email &&
          request.type === req.method.toString()
        ) {
          next();
        } else {
          res
            .status(UNAUTHORIZED)
            .json({ message: "Not Authorised....Check the request status" });
        }
      } else {
        res.status(NOTFOUND).json({ message: `Request not found ${reqId}` });
      }
    } catch (e) {
      res.status(SERVERERROR).json({ message: e });
    }
  } else {
    res.status(UNAUTHORIZED).json({ message: "not an admin" });
  }
};
