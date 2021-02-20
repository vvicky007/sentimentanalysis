const express = require('express');
const {getRole} = require('../middleware/getRole')
const {permissions} = require('../middleware/permissions')

const adminRouter = new express.Router();
const User = require('../db/models/users')
function router(){
    adminRouter.delete('/users/posts',getRole,permissions,async (req,res)=>{
        if(req.permissions){
            try
            {
                const {email,postId} = req.body;
                const user = await User.findUser(email)
                const updatedPosts = user.posts.filter((post)=> post.id!=postId)
                if(updatedPosts.length == user.posts.length ){
                    res.status(400).json({message:"no post found"})
                }
                else{
                user.posts = updatedPosts
                user.actions.push({action:`deleted a post by admin.Admin:${req.user.email}, postID:${postId}`})
                await user.save()
                
                res.status(200).json({message:"Deleted Successfully",posts:user.posts})
                }
            }
            catch(e){
                res.status(500).json({message:e})
            }
        }
        else{
            res.status(401).json({message:"Permission denied"+req.permissions})
        }
    })
    adminRouter.get('/users/posts',getRole,permissions,async (req,res)=>{
        if(req.permissions){
            try
            {
                const {email} = req.body;
                const user = await User.findUser(email)
                res.status(200).json({message:"Success",posts:user.posts})
                
            }
            catch(e){
                res.status(500).json({message:e})
            }
        }
        else{
            res.status(401).json({message:"Permission denied"+req.permissions})
        }
    })
    adminRouter.post('/users/posts',getRole,permissions,async (req,res)=>{
        if(req.permissions){
            try
            {
                const {email,post} = req.body;
                const user = await User.findUser(email)
                user.posts.push({post})
                user.actions.push({action:`posted by admin.Admin:${req.user.email}, postID:${postId}`})
                await user.save()
                res.status(200).json({message:"Success",posts:user.posts})
                
            }
            catch(e){
                res.status(500).json({message:e})
            }
        }
        else{
            res.status(401).json({message:"Permission denied"+req.permissions})
        }
    })
    adminRouter.get('/user/auditlogs',getRole,async (req,res)=>{
        if(req.admin){
            try{
            const {email} = req.body;
            const user =await User.findUser(email)
            user.actions.push({action:`get request by admin.Admin:${req.user.email}, postID:${postId}`})
            res.status(200).json({actions:user.actions})
            }
            catch(e){
                res.status(500).json({message:e})
            }
        }
        else{
            res.status(401).json({message:"Not an admin"})
        }
    })
    adminRouter.put('/users/posts',getRole,permissions,async (req,res)=>{
        if(req.permissions){
            try
            {
                const {email,postId,post} = req.body;
                const user = await User.findUser(email)
                const updatedPosts = user.posts.filter((post)=> post.id!=postId)
                if(updatedPosts.length == user.posts.length ){
                    res.status(400).json({message:"no post found"})
                }
                else{
                user.posts = updatedPosts
                user.posts.push({post})
                user.actions.push({action:`updated a post by admin.Admin:${req.user.email}, postID:${postId}`})
                await user.save()
                
                res.status(200).json({message:"Deleted Successfully",posts:user.posts})
                }
            }
            catch(e){
                res.status(500).json({message:e})
            }
        }
        else{
            res.status(401).json({message:"Permission denied"+req.permissions})
        }
    })
    return adminRouter
}
module.exports = router