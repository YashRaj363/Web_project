const Tag=require("../models/tags");
const Course=require("../models/Course");
const User=require("../models/User");
const {uploadImageCloudinary}=require("../utils/imageUploader");

exports.createCourse=async(req,res)=>{
    try{

        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;
    
        const thumbnail=req.files.thumbnailImage;
    
        if(!courseName || !courseDescription||!whatYouWillLearn||!price||!tag){
            return res.status(400).json({
                success:false,
                message:"All feilds are required",
            })
        }
        const userId=req.user.id;
        const instructorDetail=await User.findById({userId});
    
        if(!instructorDetail){
            return res.status(404).json({
                success:false,
                message:"Instructor is not found",
            })
        }
        const tagDetail=await Tag.findById({tag});
        if(!tagDetail){
            return res.status(404).json({
                success:false,
                message:"Tag s not found",
            })
        }
        const thumbnailImage=await uploadImageCloudinary(thumbnail,process.env.FOLDER_NAME);
    
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instrurtor:instructorDetail._id,
            whatYouWillLearn,
            price,
            tag:tagDetail._id,
            thumbnail:thumbnailImage.secure_url,
        })
    
        await User.findByIdAndUpdate(
                {_id:instructorDetail._id},
                {
                    $push:{
                        courses:newCourse._id,
                    }
                },
                {new:true},
        )
        await Tag.findByIdAndUpdate(
                {_id:tag},
                {
                    tag:tagDetail._id,
                },
                {new:true},

        )
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"New course not created",
        })
    }
}

exports.showAllCourses=async(req,res)=>{
    try{
        const allCourses=Courses.find({},{courseName:true,
                                        price:true,
                                        thumbnail:true,
                                        instructor:true,
                                        ratingAndReviewa:true,
                                        studentEnrolled:true,
        }).populate("instructor")
            .exec();

        return res.status(200).json({
            success:true,
            message:"allcourse fetch",
        })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"cant fetch course",
        })
    }
}