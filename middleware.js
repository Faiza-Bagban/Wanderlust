const Review=require("./models/reviews")

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("success","You must be logged in to create listing.");
        return res.redirect("/login");
    }
    next();
};



module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id, reviewId} =req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("success","You are not the author of this comment.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

