const express = require("express");
const router = express.Router({mergeParams: true});
wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const { validateReview , isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");



//Reviews Route - Show reviews for a listing

router.post("/", isLoggedIn, validateReview, wrapAsync (reviewController.createReview));


//Delete Review Route

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));



module.exports = router;
