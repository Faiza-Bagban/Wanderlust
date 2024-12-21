const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/reviews.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const {isLoggedIn ,isReviewAuthor}=require("./middleware.js");


main().then(()=>{
    console.log("connection succesful to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
  

app.set("views engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};





app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());                           //passport middleware always after session middleware.
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");               //middleware for flash
    res.locals.currUser=req.user;
    next();
});



//INDEX ROUTE
app.get("/listings",wrapAsync (async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("index.ejs",{allListings});

}));

//NEW ROUTE..Show se upar rakho
app.get("/listings/new",isLoggedIn,(req,res)=>{
    res.render("new.ejs");
});



//SHOW ROUTE
app.get("/listings/:id",wrapAsync (async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({path:"reviews" ,
         populate:{
            path:"author",
    },
    })
    .populate("owner");
    
    res.render("show.ejs",{listing});

}));


//CREATE ROUTE
app.post("/listings", isLoggedIn ,wrapAsync (async (req,res)=>{
    listingSchema.validate(req.body);
    const newlisting=new Listing(req.body);
    newlisting.owner=req.user._id;
    await newlisting.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

//EDIT ROUTE
app.get("/listings/:id/edit",isLoggedIn, wrapAsync (async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("edit.ejs",{listing});

}));

//UPDATE ROUTE
app.put("/listings/:id",isLoggedIn ,wrapAsync (async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");

}));

//DELETE ROUTE
app.delete("/listings/:id",isLoggedIn ,wrapAsync (async (req,res)=>{
    let {id}=req.params;
    let deletedlisting=await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");

}));


// Review route
// app.post("/listings/:id/reviews", async(req,res)=>{
//     let listing=Listing.findById(req.params.id);
//     let newReview=new Review(req.body.review);
//     await newReview.save();

//     listing.reviews.push(newReview);

   
//    await listing.save();

//    res.send("Review added succesfully");



// });

// Review route
app.post('/listings/:id/reviews',isLoggedIn,wrapAsync (async (req, res) => {
    reviewSchema.validate(req.body);
    try {
        // Find the listing by ID
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        // Create a new review
        const newReview = new Review(req.body.review);

        newReview.author=req.user._id;
        console.log(newReview);

        await newReview.save();

        // Push the new review into the listing's reviews array
        listing.reviews.push(newReview);
        await listing.save();

        req.flash("success","New Review Added!");

        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        res.status(500).send(err.message);
    }
  
}));


// Delete Review route
app.delete("/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor,wrapAsync (async(req,res)=>{
    let{id,reviewId}=req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});

    await Review.findByIdAndDelete(reviewId);

res.redirect(`/listings/${id}`);

}));


// SIGNUP ROUTE
app.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});


app.post("/signup",wrapAsync(async (req,res)=>{
    try{
        let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser= await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wanderlust!");
        res.redirect("/listings");
    });
    
    } catch(error){
        res.send(error.message);
    }
    
}));




//LOGIN ROUTE
app.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

app.post("/login",passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust!");
    res.redirect("/listings");
});



//LOGOUT Route
app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
});











app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});




app.use((err, req, res ,next)=>{
    let{statusCode=500,message="Something went wrong!"}=err;
    res.render("Error.ejs",{message});


    // res.status(statusCode).send(message);

});




app.listen(8080,()=>{
    console.log("listening to port 8080");
});