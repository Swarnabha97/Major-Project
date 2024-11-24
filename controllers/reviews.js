const User = require("../models/user.js");
const Listing = require("../models/listing");
const Review = require("../models/review.js");


module.exports.createReview = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    let authorName = await User.findById(req.user._id)
    newReview.author = authorName;
    console.log(newReview);
 
    listing.reviews.push(newReview);
 
    await newReview.save();
    await listing.save();
 
    console.log("new review saved");
    req.flash("success", "New review Created");
    res.redirect(`/listings/${id}`);
 };

module.exports.deleteReview = async (req, res)=>{
    let {id, reviewId} = req.params;
 
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
 
    res.redirect(`/listings/${id}`);
 };