const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");


const validateListing = (req, res, next)=> {
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError (400, result.error);
    } else{
        next();
    }
};

//INDEX Route
app.get("/", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});    
   res.render("listings/index.ejs", {allListings});
}));

//NEW Route
app.get("/new", (req,res)=>{
   res.render("./listings/new.ejs");
});

//SHOW Route
app.get("/:id", wrapAsync(async(req,res)=>{
   let {id}= req.params;
   const listing = await Listing.findById(id).populate("reviews");
   res.render("./listings/show.ejs", {listing});

}));

// //Create Route
// router.post("/", validateListing, wrapAsync(async (req,res, next)=>{
//    //let {title, description, price, location, country} =req.body;
      
//        const newListing = new Listing(req.body.listing);
//        console.log(newListing);
//        await newListing.save();
//        res.redirect("/listings");
         
//    }));
  

//EDIT Route
app.get("/:id/edit", wrapAsync(async (req,res)=>{
   let {id}= req.params;
   const listing = await Listing.findById(id);
   res.render("./listings/edit.ejs", {listing});
}));

//UPDATE Route
app.put("/:id", wrapAsync(async(req,res)=>{
   let {id}= req.params;
   await Listing.findByIdAndUpdate(id, {...req.body.listing});
   res.redirect(`/listings/${id}`);

}));

//DELETE Route
app.delete("/:id", wrapAsync(async (req,res)=>{
   let {id} = req.params;
   let Deleted_list = await Listing.findByIdAndDelete(id);
   console.log(Deleted_list);
   res.redirect("/listings");
}));

// module.exports = router;