if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
};


const express = require("express");
const app= express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const { date } = require("joi");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const isLoggedIn = require("./middleware.js");
const saveRedirectUrl = require("./middleware.js");
const isOwner = require("./middleware.js");
const isReviewAuthor = require("./middleware.js");
const multer  = require('multer');
const {storage} = require("./cloudconfig.js");
const upload = multer({ storage });

const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/reviews.js");
const userController = require("./controllers/users.js");




app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=>{
    console.log("error in Mongo session Store", err);
})


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,    
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res, next)=> {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req, res)=>{
//     let fakeUser = new User({
//         email: "abc@gmail.com",
//         username: "student1"
//     });
//     let registeredUser = await User.register(fakeUser,"hello123" );
//     res.send(registeredUser);
// });


// const mongoUrl = 'mongodb://127.0.0.1:27017/wanderlust';

//Connection creation to mongodb
async function main() {
  await mongoose.connect(dbUrl);

};


main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
});

// app.get("/",(req,res)=>{
//     res.send("Hi, I am working");
// });

const validateReview = (req, res, next)=> {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError (400, errMsg);
    } else{
        next();
    }
};

const validateListing = (req, res, next)=> {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError (400, errMsg);
    } else{
        next();
    }
};

//Create Route
app.post("/listings",isLoggedIn, upload.single('listing[image]'), wrapAsync(listingController.createListing));


//INDEX Route
app.get("/listings", wrapAsync(listingController.index));

//NEW Route
app.get("/listings/new",isLoggedIn,listingController.renderNewForm);

//SHOW Route
app.get("/listings/:id", wrapAsync(listingController.showlisting));

//  EDIT Route
app.get("/listings/:id/edit",isLoggedIn, wrapAsync(listingController.editListing));
 
 //UPDATE Route
 app.put("/listings/:id",isLoggedIn, isOwner,upload.single('listing[image]'), wrapAsync(listingController.updateListing));
 
 //DELETE Route
 app.delete("/listings/:id",isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

//Reviews Post
app.post("/listings/:id/reviews",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

 //Delete Review
 app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview));


// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing ({
//         title: "Sunset Villa",
//         description: "By the beach",
//         price: 10000,
//         location: "Goa",
//         country: "India",

//     });
//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("successful testing");
// });




// app.all("*", (req, res, next)=>{
//     next(new ExpressError(404, "Page not found"));
// });

//signUp

app.get("/signup", userController.renderSignupForm);

app.post("/signup", wrapAsync(userController.signup));

//LOGIN

app.get('/login', userController.renderLoginForm);

app.post("/login", passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}) ,userController.login);

app.get("/logout", userController.logout);

app.use((err, req, res, next)=> {
    let {status=500, message="Something went wrong!"} = err;
    res.render("error.ejs", {message});
    console.log(err);
})

// app.listen(8080,()=>{
//     console.log("server is listening to port 8080");
// });