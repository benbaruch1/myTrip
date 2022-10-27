const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync')
const Review = require('../models/review');
const Hotel = require('../models/hotel');
const { validateReview, isLoggedIn, reviewVerifyOwner } = require('../middleware');
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, reviewVerifyOwner, catchAsync(reviews.deleteReview));

module.exports = router;