const express = require("express");
const { getRole } = require("../middleware/getRole");
const { permissions } = require("../middleware/permissions");
const {
  SERVERERROR,
  OK,
  NOTFOUND,
  UNAUTHORIZED,
  admin,
} = require("../constants");
const adminRouter = new express.Router();
const User = require("../db/models/users");
const Request = require("../db/models/requests");
function router() {
  adminRouter.delete("/users/posts", getRole, permissions, async (req, res) => {
    if (req.permissions) {
      try {
        const { email, postId } = req.body;
        const user = await User.findUser(email);
        const updatedPosts = user.posts.filter((post) => post.id != postId);
        if (updatedPosts.length == user.posts.length) {
          res.status(NOTFOUND).json({ message: "no post found" });
        } else {
          user.posts = updatedPosts;
          user.actions.push({
            action: `deleted a post by admin.Admin:${req.user.email}, postID:${postId}`,
          });
          await user.save();

          res
            .status(OK)
            .json({ message: "Deleted Successfully", posts: user.posts });
        }
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res
        .status(UNAUTHORIZED)
        .json({ message: "Permission denied" + req.permissions });
    }
  });
  adminRouter.get("/users/posts", getRole, permissions, async (req, res) => {
    if (req.permissions) {
      try {
        const { email } = req.body;
        const user = await User.findUser(email);
        res.status(OK).json({ message: "Success", posts: user.posts });
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res
        .status(UNAUTHORIZED)
        .json({ message: "Permission denied" + req.permissions });
    }
  });
  adminRouter.post("/users/posts", getRole, permissions, async (req, res) => {
    if (req.permissions) {
      try {
        const { email, post } = req.body;
        const user = await User.findUser(email);
        user.posts.push({ post });
        user.actions.push({
          action: `posted by admin.Admin:${req.user.email}, post:${post}`,
        });
        await user.save();
        res.status(OK).json({ message: "Success", posts: user.posts });
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res
        .status(UNAUTHORIZED)
        .json({ message: "Permission denied" + req.permissions });
    }
  });
  adminRouter.get("/user/auditlogs", getRole, async (req, res) => {
    if (req.admin) {
      try {
        const { email } = req.body;
        const user = await User.findUser(email);
        user.actions.push({
          action: `audit logs requested by admin ${req.user.email}`,
        });
        await user.save();
        res.status(OK).json({ actions: user.actions });
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res.status(UNAUTHORIZED).json({ message: "Not an admin" });
    }
  });
  adminRouter.put("/users/posts", getRole, permissions, async (req, res) => {
    if (req.permissions) {
      try {
        const { email, postId, post } = req.body;
        const user = await User.findUser(email);
        const updatedPosts = user.posts.filter((post) => post.id != postId);
        if (updatedPosts.length == user.posts.length) {
          res.status(NOTFOUND).json({ message: "no post found" });
        } else {
          user.posts = updatedPosts;
          user.posts.push({ post });
          user.actions.push({
            action: `updated a post by admin.Admin:${req.user.email}, postID:${postId}`,
          });
          await user.save();

          res
            .status(OK)
            .json({ message: "Updated Successfully", posts: user.posts });
        }
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res
        .status(UNAUTHORIZED)
        .json({ message: "Permission denied" + req.permissions });
    }
  });
  adminRouter.post("/raiseReq", getRole, async (req, res) => {
    if (req.admin) {
      try {
        const { email, actionType } = req.body;
        const request = new Request({
          raisedBy: req.user.email,
          raisedFor: email,
          type: actionType,
        });
        await request.save();
        res.status(200).json({ request });
      } catch (e) {
        console.log(e);
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res.status(UNAUTHORIZED).json({ message: "Permission denied" });
    }
  });
  return adminRouter;
}
module.exports = router;
