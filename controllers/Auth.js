const bcrypt=reqire("bcrypt");
const User=require("../models/User");
const OTP=require("../models/OTP");
const Profile=require("../models/Profile");


//sendotp
exports.sendOTP=async(req,res)=>{
    try{

        const {email}=req.body;
        
        const existinguser=await User.findOne({email});
        if(existinguser){
            return res.status(401).json({
                success:false,
                message:"user already Exist"
            })
        }
        
        var otp=otpGenerator.generate(6,{
                UpperCaseAlphabet:false,
                lowerCaseAlphabet:false,
                specialChars:false,
        });
        
        let result=await OTP.findOne({otp:otp});
        while(result){
            otp=otpGenerator.generate(6,{
                UpperCaseAlphabet:false,
                lowerCaseAlphabet:false,
                specialChars:false,
            });
            result=await OTP.findOne({otp:otp});
        }
        const otpbody=await OTP.create({
            email,otp
        })
        res.status(200).json({
            success:true,
            message:"user crestion successfully",
            otp,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"OTP send failed",
        })
    }
}

//signup
exports.signup=async(req,res)=>{
    const {firstname,lastname,email,createPassword,confirmPassword,accountType,contactNumber,otp}=req.body;
    if(!firstname || !lastname || !email || !createPassword || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        })
    }
    if(createPassword != confirmPassword){
        return res.status(400).json({
            success:false,
            message:"CreatePassword and cnfPassword are not matching"
        })
    }
    const recentOtp=(await OTP.find({email})).toSorted({createdAt:-1}).limit(1);
    if(recentOtp.length ==0){
        return res.status(400).json({
            success:false,
            message:"OTP found"
        })
    }
    else if(otp !== recentOtp.otp){
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        })
    }
    const existingUser=User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User already Exist",
        })
    }
    let hashedPassword;
    try{
        hashedPassword=await bcrypt.hash(password,10);
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in hashing password",
        });
    }
    const profileDetails=await Profiler.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    })
    try{
        const user=await User.create({
            firstname,lastname,email,contactNumber,password:hashedPassword,accountType,additionalDetails:profileDetails._id,
            image:`dicebear pe ja kr api lao` 
        })
        return res.status(200).json({
            success:true,
            message:"User Created Successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User creation failed',
        }) 
    }
}
//Login

//changePassword