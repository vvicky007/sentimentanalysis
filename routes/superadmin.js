const express = require('express');
const {getRole} = require('../middleware/getRole')
const superadminRouter = new express.Router();
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');
const natural = require('natural');
const SW = require('stopword');
const User = require('../db/models/users')
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
function router(){
    
    superadminRouter.get('/permissions/:id',getRole,async (req,res)=>{
        try{
            console.log(req.params)
            if(req.admin)
            {   
                res.status(200).json({"message":"Success","permission":true})
            }
            else{
                res.status(401).send({ message:'No authentication'})
            }
        }
        catch(e){
            res.status(500).json({"message":e})
            console.log('error',e)
        }
    })

    superadminRouter.get('/user/auditlogs',getRole,async (req,res)=>{
        if(req.superadmin){
            try{
            const {email} = req.body;
            const user =await User.findUser(email)
            res.status(200).json({actions:user.actions})
            }
            catch(e){
                res.status(500).json({message:e})
            }
        }
        else{
            res.status(401).json({message:"Not an super admin"})
        }
    })
    superadminRouter.get('/user/analyse',getRole,async (req,res)=>{
        if(req.superadmin){
            try{
            const {email} = req.body;
            const user =await User.findUser(email)
            let analysis =[]
            
            user.posts.forEach((post)=>{
               
                    let lexedReview = aposToLexForm(post.post);
                    const casedReview = lexedReview.toLowerCase();
                    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');
                    const { WordTokenizer } = natural;
                    const tokenizer = new WordTokenizer();
                    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
                    tokenizedReview.forEach((word, index) => {
                        tokenizedReview[index] = spellCorrector.correct(word);
                        
                    })
                
                    const filteredReview = SW.removeStopwords(tokenizedReview);
                    
                    const { SentimentAnalyzer, PorterStemmer } = natural;
                    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
                    let x = analyzer.getSentiment(filteredReview);
                    analysis.push(x)
                
            })
            console.log(analysis)
            let sum = analysis.reduce((a, b) => a + b, 0)
            let avg = sum/analysis.length
            if(avg<0){
                res.status(200).json({message: 'Bad'})
            }
            else if(avg>0){
                res.status(200).json({message: 'Good'})
            }
            else{
                res.status(200).json({message: 'Neutral'})
            }
            }
            catch(e){
                res.status(500).json({message:e})
            }
        }
        else{
            res.status(401).json({message:"Not an super admin"})
        }
    })


    return superadminRouter
}
module.exports = router