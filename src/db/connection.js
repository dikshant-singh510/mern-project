const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mernFormRegistration").then(()=>{
  console.log("database successfully connected...");
}).catch((err)=>{
  console.log(err.message);
})