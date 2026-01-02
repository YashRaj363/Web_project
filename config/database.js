const mongoose=require('mongoose');
require('dotenv').config();

const dbconnect=()=>{
    mongoose.connect(process.env.DATABASE_URL,{
        useNewUserParser:true,
        useUnifiedTopology:true
    })
    .then(()=>{
        console.log("Db connect");
    })
    .catch((error)=>{
        console.log("Issue in connection");
        console.log(error.message);
    });
}

module.exports=dbconnect;