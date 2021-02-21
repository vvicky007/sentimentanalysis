const express = require("express");
const User = require("../db/models/users");
const { verifyToken } = require("../middleware/verifyToken");
const md5 = require("md5");
const { SERVERERROR, OK, NOTFOUND, UNAUTHORIZED } = require("../constants");
const userRouter = express.Router();
function router() {
  userRouter.route("/signin").post(async (req, res) => {
    const { email, password, role } = req.body;
    const user = new User({ email, password: md5(password), role });
    const userinfo = await User.findUser(email);
    if (userinfo != null) {
      res.status(302).json({
        message: "user already exists",
      });
    } else {
      try {
        const token = await user.generateToken();
        user.save();
        res.status(OK).json({ email: user.email, token, message: "success" });
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    }
  });
  userRouter.post("/post", verifyToken, async (req, res) => {
    try {
      const { post } = req.body;
      req.user.actions.push({ action: "uploaded a post:" + post });
      req.user.posts.push({ post });
      await req.user.save();
      res.status(OK).send(req.user.posts);
    } catch (e) {
      res.status(SERVERERROR).json({ message: e });
    }
  });
  userRouter.get("/posts", verifyToken, async (req, res) => {
    try {
      const posts = req.user.posts.reverse();
      req.user.actions.push({ action: "requested for posts" });
      await req.user.save();
      res.status(OK).send(posts);
    } catch (e) {
      res.status(SERVERERROR).json({ message: e });
    }
  });
  userRouter.delete("/post", verifyToken, async (req, res) => {
    try {
      const { postId } = req.body;
      const updatedPosts = req.user.posts.filter((post) => post.id != postId);
      req.user.posts = updatedPosts;
      req.user.actions.push({ action: "deleted a post. postID:" + postId });
      await req.user.save();
      res
        .status(OK)
        .json({ posts: req.user.posts, message: "Deleted Successfully" });
    } catch (e) {
      res.status(SERVERERROR).json({ message: e });
    }
  });

  return userRouter;
}
module.exports = router;
