const express = require("express");
const router = express.Router({mergeParams:true});
const {isLoggedIn,isReviewAuthor}=require("../middleware.js");

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); 

const reviewController=require("../controllers/reviews.js");

// POST: Add a review
router.post("/",isLoggedIn, wrapAsync(reviewController.createReview));

// DELETE: Delete a review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;
