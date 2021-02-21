const { secret } = require(".././constants");
const jwt = require("jsonwebtoken");
const User = require("../db/models/users");
const { UNAUTHORIZED } = require("../constants");
exports.verifyToken = async (req, res, next) => {
  if (!req.headers.authorization)
    res.status(UNAUTHORIZED).send({ message: "Not authorized to access data" });
  else {
    const token = req.headers.authorization.split(" ")[1];
    if (!token)
      res
        .status(UNAUTHORIZED)
        .send({ message: "Not Authorized to access data" });
    else {
      try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findOne({ _id: decoded.id });
        req.user = user;
        next();
      } catch (e) {
        console.log(e);
        res.status(UNAUTHORIZED).send({ message: "Please Login again" });
      }
    }
  }
};
