const Review = require('../models/review');
const Hotel = require('../models/hotel');


module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const review = new Review(req.body.review);
    review.author = req.user._id;
    const hotel = await Hotel.findById(id);
    hotel.reviews.push(review);
    await review.save();
    await hotel.save();
    req.flash('success', 'Successfully posted review.');
    res.redirect(`/hotels/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review.');
    res.redirect(`/hotels/${id}/`)
};
