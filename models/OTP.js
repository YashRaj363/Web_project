const mongoose=require("mongoose")
const mailSender=require("mailSender");

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createAt:{
        type:Date,
        default:Date.now,
        expire: 5*60
    }
});

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"Verification mail from Webzilla Classes",otp);
        console.log("Email sent successfully");
    }
    catch(error){
        console.log(error.message);
        throw error;
    }
}

OTPSchema.pre("save",async function(next) {
    await sendVerificationEmail(this.email,this.otp);
    next();
});

module.exports=mongoose.model("OTP",OTPSchema);