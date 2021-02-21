const User = require("../db/models/users");
const axios = require("axios");
const { SERVERERROR, UNAUTHORIZED } = require("../constants");
exports.permissions = async (req, res, next) => {
  if (req.admin) {
    const { email } = req.body;

    try {
      const user = await User.findUser(email);
      const resp = await axios.get(
        "http://localhost:3000/superadmin/permissions/" + user.id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + req.token,
          },
        }
      );
      req.permissions = resp.data.permission;
      next();
    } catch (e) {
      res.status(SERVERERROR).json({ message: e });
    }
  } else {
    res.status(UNAUTHORIZED).json({ message: "not an admin" });
  }
};
