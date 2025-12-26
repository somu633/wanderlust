const Listing = require("../models/listing");
const Review = require("../models/review");

// Create Review Logic

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;            // Logged-in user ko author set karna

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

// Delete Review Logic
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    // Listing se review ki ID remove karna aur Review collection se delete karna

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};