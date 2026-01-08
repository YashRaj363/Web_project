const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");

exports.resetPasswordToken=async(req,res)=>{
    try{
        const {email}=req.body;
    
        if(!email){
            return res.status(401).json({
                success:false,
                message:"All fields are required"
            })
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User is not registered"
            })
        }
        const token=crypto.randomUUID();
        const updatedToken=await User.findOneAndUpdate(
                                    {email:email},
                                {
                                    token:token,
                                    resentPasswordExpires:Date.now() + 5*60*1000,
                                },
                                {new:true});
        const url=`https://localhost:3000/update-password/${token}`
        await mailSender(email,
            "Reset Password for WebZilla Portal",
            `Password Reset Link: ${url}`);

        return res.status(200).json({
            success:true,
            message:"Reset Password Link Sent",
        })
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong, Reset password mail is not sent"
        })
    }
}

exports.resetPassword=async(req,res)=>{
    try{
        const {password,confirmPassword,token}=req.body;
        if(!password || !confirmPassword || !token){
            return res.status(401).json({
                success:false,
                message:"All fields are required",
            })
        }
        if(password !== confirmPassword){
            return res.status(401).json({
                success:false,
                message:"Both Password and cnf password is not match",
            })
        }
        const user=await User.findOne({token:token});
        if(user.resentPasswordExpires < Date.now()){
            return res.status(401).json({
                success:false,
                message:"Token expires",
            })
        }
        let hashPassword=await bcrypt.hash(password,10);
        const passwordUpdate=await User.findOneAndUpdate(
                                    {token:token},
                                    {password:hashPassword},
                                    {next:true},
        )
        return res.status(400).json({
            success:true,
            message:"Password reset successfully"
        })
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong,Password is not reset"
        })
    }

}