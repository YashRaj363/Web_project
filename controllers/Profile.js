const Profile=require("../models/Profile");
const User=require("../models/User");

exports.updateProfile=async(req,res)=>{
    try{
        const{gender,dateOfBirth,about,phone,userId}=req.body;
        const id=req.user.id;
        if(!gender||!phone||!id){
            return res.status(404).json({
                success:false,
                message:"All fields required"
            })
        }
        const userDetails=await User.findById(id);
        const profileId=await userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);
        
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.phone=phone;
        await profileDetails.save();

        return res.status(200).json({
            success:true,
            message:"Profile detailed updated"
        })
    }
    catch(error){
        return res.status(400).json({
            success:true,
            message:"Profile detailed not updated"
        })
    }
}

exports.deleteAccount=async(req,res)=>{
    try{
        const id=req.user.id;
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"user not found"
            })
        }
        const profileId=await userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);
        await User.findByIdAndDelete(id);

        return res.status(200).json({
                success:true,
                message:"user delete successfully"
            })
    }
    catch(error){
        return res.status(400).json({
                success:false,
                message:"user not delete "
            })
    }
}