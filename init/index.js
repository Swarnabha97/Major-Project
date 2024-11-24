const mongoose= require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

//Connection creation to mongodb
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  
  };
  
  main().then(()=>{
      console.log("Connected to DB");
  }).catch((err)=>{
      console.log(err);
  });
  
  const initDB = async()=> {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: "671d34d5c76e965978869406"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
  };

  initDB();
