const Tag=require("../models/tags");


exports.createTag=async(req,res)=>{
    try{
        const {name,description}=req.body;
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fiels are required",
            })
        }
        const tagDetails=await Tag.create({
            name:name,
            description:description,
        })
        console.log(tagDetails);

        return res.status(200).json({
                success:true,
                message:"Tag created Successfully",
            })
    }
    catch(error){
        return res.status(400).json({
                success:false,
                message:"Tags creation failed",
            })
    }
}

exports.showAllTags=async(req,res)=>{
    try{
        const showTags=await Tag.find({},{name:true},{description:true});
        return res.status(200).json({
                success:true,
                message:"All tags are shown",
            })
    }
    catch(error){
        return res.status(400).json({
                success:false,
                message:"All tags show failed",
            })
    }
}