const ExpressError = require('./utils/ExpressError')
const { hotelSchema, reviewSchema } = require('./schemas')
const Hotel = require('./models/hotel');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed-in.');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateHotel = (req, res, next) => {
    const { error } = hotelSchema.validate(req.body); // pass the object 'req.body' object and check for validation errors
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg);
    }
    else {
        next();
    }
}

module.exports.hotelVerifyOwner = async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel.author.equals(req.user._id)) {
        req.flash('error', "You don't own this hotel page!");
        return res.redirect(`/hotels/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); // pass the 'req.body' object and check for validation errors
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg);
    }
    else {
        next();
    }
}

module.exports.reviewVerifyOwner = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You don't own this review!");
        return res.redirect(`/hotels/${id}`);
    }
    next();
}