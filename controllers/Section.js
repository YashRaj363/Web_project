const Section=require("../models/Section");
const Course=require("../models/Course");

exports.createSection=async(req,res)=>{
    try{
        const{sectionName,courseId}=req.body;
        if(!sectionName || !courseId){
            return res.status(404).json({
                success:true,
                message:"All fields are required",
            })
        }
        const newSection=await Section.create({
            sectionName
        });
        const updateCourse=await Course.findByIdAndUpdate(
                                    {id:courseId},
                                {
                                    $push:{
                                        courseContent:newSection._id
                                    }
                                },
                            {new:true}).populate("Section");
        return res.status(200).json({
            success:true,
            message:"New section created successfully"
        })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"New Section creation failed",
        })
    }
}

exports.updateSection=async(req,res)=>{
    try{
        const{sectionName,sectionId}=req.body;
    
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Properties are missing"
            })
        }
        const section=await Section.findByIdAndUpdate(
                                {id:sectionId},
                                {sectionName},
                                {new:true}
        )
        return res.status(200).json({
            success:true,
            message:"Section updated Successfully"
        })
    }
    catch(error){
        return res.status(404).json({
            success:false,
            message:"Section creation failed"
        })
    }
}