const {instance}=require("../config/razorpay");
const User=require("../models/User");
const Course=require("../models/Course");
const mailSender=require("../utils/mailSender");

exports.capturePayment=async(req,res)=>{
    try{

        const userId=req.user.id;
        const {courseId}=req.body;
        if(!courseId){
            return res.status.json({
                success:false,
                message:"please provide course id"
            })
        }
        let course;
        try{
            course=await Course.findById(courseId);
            if(!course){
                return res.status.json({
                success:false,
                message:"could not find any course"
                })
            }
            const uid=new mongoose.Types.ObjectId(userId);
            if(!course.studentEnrolled.includes(uid)){
                return res.status.json({
                success:false,
                message:"student already enrolled",
                })
            }
        }
        catch(error){
            return res.status.json({
                success:false,
                message:"error in getting student enroll data"
            })
        }
        const amount=course.price;
        const currency="INR";
        const options={
            amount: amount*100,
            currency,
            recipt:Math.random(Date.now().toString()),
            notes:{
                courseId:course._id,
                userId
            }
        }
        try{
            const paymentResponse=instance.orders.create(options);
            console.log(paymentResponse);
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                orderId:paymentResponse.id
            })
        }
        catch(error){
            console.log(error);
        }
    }
    catch(error){

    }
}

exports.verifySignature=async(req,res)=>{
    try{
        const webhookSecret="12345678";
        const signature=req.header["x-razorpay-signature"];

        const shasum=crypto.createHmac("sha256",webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest=shasum.digest("hex");

        if(digest==signature){
            console.log("Payment is autorised");

            const {userId,courseId}=req.body.payload.payment.entity.notes;
            try{
                const enrolledCourse=await Course.findByIdAndUpdate(
                                        {_id:courseId},
                                        {
                                            $push:{
                                                studentEnrolled:userId,
                                            }
                                        },
                                        {new:true},
                )
                if(!enrolledCourse){
                    return res.status(400).json({
                        success:false,
                        message:"Course not found"
                    })
                }
                const enrolledStudent=await Course.findByIdAndUpdate(
                                                {_id:userId},
                                            {
                                                $push:{
                                                    courses:courseId
                                                }
                                            },
                                            {new:true}
                )
                const mailResponse=await mailSender(
                                    enrolledStudent.email,
                                    "congo, You are enrolled for new batch")
            }
            catch(error){
                return res.status(400).json({
                        success:false,
                        message:"Signature verified and course added",
                    })
            }
        }
        else{
            return res.status(400).json({
                        success:false,
                        message:"Signature not verified"
                    })
        }
    }
    catch(error){
        return res.status(400).json({
                        success:false,
                        message:error.message
                    })
    }
}