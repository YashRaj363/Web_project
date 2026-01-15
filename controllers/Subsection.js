const SubSection=require("../models/SubSection");
const Section=require("../models/Section");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

exports.createSubsection=async(req,res)=>{
    try{
        const {title,timeDuration,description,sectionId}=req.body;
    
        const video=res.files.videoFile;
    
        if(!title || !timeDuration||!description||!video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const uploadVideo=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        const SubSectionDetails=await SubSection.create({
            title,timeDuration,description,videoUrl:uploadVideo.secure_url
        })
        const updateSection=await Section.findByIdAndUpdate(
                                        {_id:sectionId},
                                        {
                                            $push:{
                                                subSection:SubSectionDetails._id,
                                            }
                                        },
                                        {new:true}
        )
        return res.status(200).json({
            success:true,
            message:"Subsection created",
        })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"Subsection not created"
        })
    }
}