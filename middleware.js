const Listing = require("./models/listing");
const Review = require("./models/review");

isLoggedIn =(req,res, next)=>{
    if(!req.isAuthenticated()) {
        // console.log(req.session.redirectUrl);
        req.flash("error", "You need to login first to create listings");
        return res.redirect("/login");
    };
    next();
};

module.exports = isLoggedIn;


// module.exports.saveRedirectUrl = (req, res, next)=>{
//     console.log("req.session.redirectUrl-",req.session.redirectUrl)
//     if(req.session.redirectUrl) {
//         res.locals.redirectUrl = req.session.redirectUrl;
//     };
//     console.log(res.locals.redirectUrl);
//     next();
// };

// module.exports = saveRedirectUrl;

module.exports.isOwner = async (req, res, next)=>{
    let {id}= req.params;
    let listing = await Listing.findById(id);
    
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

module.exports.isReviewAuthor = async (req, res, next)=>{
    let {id, reviewId}= req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    };
    next();
};
