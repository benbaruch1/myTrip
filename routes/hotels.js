const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Hotel = require('../models/hotel');
const { isLoggedIn, hotelVerifyOwner, validateHotel } = require('../middleware');
const hotels = require('../controllers/hotels')
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(hotels.index))
    .post(isLoggedIn, upload.array('image'), validateHotel, catchAsync(hotels.createHotel));

router.get('/new', isLoggedIn, hotels.renderNewForm);

router.route('/:id')
    .get(catchAsync(hotels.showHotel))
    .put(isLoggedIn, hotelVerifyOwner, upload.array('image'), validateHotel, catchAsync(hotels.updateHotel))
    .delete(isLoggedIn, hotelVerifyOwner, catchAsync(hotels.deleteHotel));


router.get('/:id/edit', isLoggedIn, hotelVerifyOwner, catchAsync(hotels.renderEditForm));



module.exports = router;