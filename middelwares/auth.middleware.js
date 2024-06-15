const jwt = require("jsonwebtoken");
const blacklisted = require("../blacklist")

const auth = (req,res,next)=>{
  let token = req.headers.authorization.split(" ")[1]
  if(token){
    if(blacklisted.includes(token)){
        return res.send("YOu are blacklisted , please login")
    }
  }
    jwt.verify(token,"prettycode",(err,decoded)=>{
        if(err){
            console.log(err)
            res.send("Please login first")
        }else{
            //  console.log(decoded)
            req.user = decoded
            next()
        }
    })
   
}

module.exports = auth 