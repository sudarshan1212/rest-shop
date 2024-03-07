const jwt=require('jsonwebtoken')
module.exports=(req,res,next)=>{
    try {
        const auth=req.headers.Authorization ||req.headers.authorization;
        const token=auth.split(" ")[1]
        const decode=jwt.verify(token,process.env.ACCESS_TOKEN_SERVER)
        req.userData=decode
        console.log("i am token");
        next()
    } catch (error) {
        res.status(200).json({err:error})
    }
}