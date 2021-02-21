const express = require("express");
const { getRole } = require("../middleware/getRole");
const superadminRouter = new express.Router();
const aposToLexForm = require("apos-to-lex-form");
const SpellCorrector = require("spelling-corrector");
const natural = require("natural");
const { SERVERERROR, OK, NOTFOUND, UNAUTHORIZED } = require("../constants");
const SW = require("stopword");
const User = require("../db/models/users");
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
function router() {
  superadminRouter.get("/permissions/:id", getRole, async (req, res) => {
    try {
      console.log(req.params);
      if (req.admin) {
        res.status(OK).json({ message: "Success", permission: true });
      } else {
        res.status(UNAUTHORIZED).send({ message: "No authentication" });
      }
    } catch (e) {
      res.status(SERVERERROR).json({ message: e });
      console.log("error", e);
    }
  });

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
