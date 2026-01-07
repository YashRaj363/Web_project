const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender=require("../utils/mailSender");
require("dotenv").config();


exports.sendOTP = async (req,res)=>{
    try{
        const {email} = req.body;
        
        const existinguser = await User.findOne({email});
        if(existinguser){
            return res.status(401).json({
                success:false,
                message:"user already Exist"
            })
        }
        
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        
        let result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpbody = await OTP.create({
            email,otp
        });

        res.status(200).json({
            success:true,
            message:"OTP generated successfully",
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
exports.signup = async (req,res)=>{
    const {firstname,lastname,email,createPassword,confirmPassword,accountType,contactNumber,otp} = req.body;

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

    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);

    if(recentOtp.length == 0){
        return res.status(400).json({
            success:false,
            message:"OTP not found"
        })
    }
    else if(otp !== recentOtp[0].otp){
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        })
    }

    const user = await User.findOne({email});
    if(user){
        return res.status(400).json({
            success:false,
            message:"User already Exist",
        })
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(createPassword,10);
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in hashing password",
        });
    }

    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });

    try{
        const newUser = await User.create({
            firstname,
            lastname,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
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
exports.login = async (req,res)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required, please try again",
            })
        }

        const user = await User.findOne({email}).populate("additionalDetails");

        if(!user){    
            return res.status(400).json({
                success:false,
                message:"User is not signUp",
            })
        }

        const payload = {
            email:user.email,
            id:user._id,
            role:user.accountType,
        }

        if(await bcrypt.compare(password,user.password)){

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn:"2h" }
            )

            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }

            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Loged in successfully",
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({
            success:false,
            message:"Login failure,please try again"
        })
    }
}
// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "User not registered",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password incorrect",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "New password & Confirm password mismatch",
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();

    await mailSender(user.email,"Password change Mail",
        `<h2>Hi ${user.firstname}</h2>
        <p>Your password was successfully updated.</p>
        <p>If this wasn't you, please reset your password immediately.</p>
        <br/>
        <p>Webzilla Security Team</p>`
    )
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Password change failed",
    });
  }
};
