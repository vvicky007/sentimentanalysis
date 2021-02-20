const User = require('../db/models/users')
const axios = require('axios')
exports.permissions= async(req, res, next) =>
{
    if(req.admin){
        const {email} = req.body;
        
        try
        {
            const user = await User.findUser(email)
            const resp =await axios.get('http://localhost:3000/superadmin/permissions/'+user.id,{
                headers: { "Content-Type": "application/json",Authorization: "Bearer " + req.token },
            })
            req.permissions = resp.data.permission
            next()
        }
        catch(e){
            res.status(500).json({message:e})
        }
    }
    else{
        res.staus(401).json({message:'not an admin'})
    }
}
