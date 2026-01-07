const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

exports.auth=async(req,res,next)=>{
    try{
        const token=req.cookies.token || res.body.token || req.header("Authorization").replace("Bearer","");
        if(!token){
            return res.status(400).json({
                success:false,
                message:"token is missing",
            })
        }
        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            res.user=decode;
        }
        catch(error){
            return res.status(401).json({
                success:false,
                message:"token is invalid",
            })
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong"
        })
    }
}

exports.isStudent=async(req,res,next)=>{
    try{
        if(res.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"THis is protected route for student",
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
                success:false,
                message:"User role cannot be verified try again",
            })
    }
}

exports.isInstructor=async(req,res,next)=>{
    try{
        if(res.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"THis is protected route for Instructor",
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
                success:false,
                message:"User role cannot be verified try again",
            })
    }
}