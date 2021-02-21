const express = require("express");
const { getRole } = require("../middleware/getRole");
const superadminRouter = new express.Router();
const aposToLexForm = require("apos-to-lex-form");
const SpellCorrector = require("spelling-corrector");
const natural = require("natural");
const { SERVERERROR, OK, NOTFOUND, UNAUTHORIZED } = require("../constants");
const SW = require("stopword");
const User = require("../db/models/users");
const Request = require("../db/models/requests");
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
function router() {
  superadminRouter.get("/user/auditlogs", getRole, async (req, res) => {
    if (req.superadmin) {
      try {
        const { email } = req.body;
        const user = await User.findUser(email);
        res.status(OK).json({ actions: user.actions });
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res.status(UNAUTHORIZED).json({ message: "Not an super admin" });
    }
  });
  superadminRouter.get("/requests", getRole, async (req, res) => {
    if (req.superadmin) {
      const requests = await Request.find();
      res.status(OK).json({ requests });
    } else {
      res.status(UNAUTHORIZED).json({ message: "Not a super admin" });
    }
  });
  superadminRouter.patch("/request", getRole, async (req, res) => {
    if (req.superadmin) {
      try {
        const { reqId, status } = req.body;
        const request = await Request.find({ _id: reqId });
        const user = await User.find({ email: request[0].raisedBy });
        if (request.length != 0 && user.length != 0) {
          if (user[0].role === "admin") {
            request[0].status = status === "true";
            await request[0].save();
            res.status(OK).send({ message: "success" });
          } else {
            res.status(NOTFOUND).json({ message: "Admin does not exist" });
          }
        } else {
          res.status(NOTFOUND).json({
            message: `No req found with id ${reqId} or admin does not exist`,
          });
        }
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res.status(UNAUTHORIZED).json({ message: "Not a super admin" });
    }
  });
  superadminRouter.get("/user/analyse", getRole, async (req, res) => {
    if (req.superadmin) {
      try {
        const { email } = req.body;
        const user = await User.findUser(email);
        let analysis = [];

        user.posts.forEach((post) => {
          let lexedReview = aposToLexForm(post.post);
          const casedReview = lexedReview.toLowerCase();
          const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, "");
          const { WordTokenizer } = natural;
          const tokenizer = new WordTokenizer();
          const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
          tokenizedReview.forEach((word, index) => {
            tokenizedReview[index] = spellCorrector.correct(word);
          });

          const filteredReview = SW.removeStopwords(tokenizedReview);

          const { SentimentAnalyzer, PorterStemmer } = natural;
          const analyzer = new SentimentAnalyzer(
            "English",
            PorterStemmer,
            "afinn"
          );
          let x = analyzer.getSentiment(filteredReview);
          analysis.push(x);
        });
        let sum = analysis.reduce((a, b) => a + b, 0);
        let avg = sum / analysis.length;
        if (avg < 0) {
          res.status(OK).json({ message: "Bad" });
        } else if (avg > 0) {
          res.status(OK).json({ message: "Good" });
        } else {
          res.status(OK).json({ message: "Neutral" });
        }
      } catch (e) {
        res.status(SERVERERROR).json({ message: e });
      }
    } else {
      res.status(UNAUTHORIZED).json({ message: "Not an super admin" });
    }
  });

  return superadminRouter;
}
module.exports = router;
