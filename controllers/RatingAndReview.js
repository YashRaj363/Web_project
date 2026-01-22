const RatingAndReview=require('../models/RatingAndReview')
const Course=require('../models/Course');

exports.createRating=async(req,res)=>{
    try{
        const userId=req.user.id;
        const {rating,review,courseId}=res.body;

        const courseDetails=await Course.findOne(
                                    {_id:courseId,
                                        studentEnrolled:{$elemMatch:{$eq: userId}},
                                    },

        );
        const alreadyReviewed=await RatingAndReview.findOne({
                                user:userId,
                                course:courseId,
        })

        const ratingcreate=await RatingAndReview.create({
            rating,
            review,
            course:courseId,
            user:userId
        })
        const updateCourse=await Course.findByIdAndUpdate(
                                    {_id:courseId},
                                    {
                                        $push:{
                                            ratingAndReviews:ratingcreate,
                                        }
                                    },
                                    {new:true}
        )
    }
    catch(error){

    }
}