const Listing = require("../models/listing.js");
const Review = require("../models/review");





module.exports.createReview = async (req, res) => {



    //console.log(req.params.id);

    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; 
    console.log(newReview);// Set the author to the logged-in user

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();



    req.flash("success", "Review added successfully!");

    
    res.redirect(`/listings/${listing._id}`);
};




module.exports.destroyReview = async (req, res) => {
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    
 
    await Review.findByIdAndDelete(reviewId);
    
    
    req.flash("success", "Review deleted successfully!");




    res.redirect(`/listings/${id}`);
};