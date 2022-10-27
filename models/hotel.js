const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const cloudinary = require('../cloudinary');

const HotelSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});


HotelSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Review.remove({
            _id: {
                $in: data.reviews
            }
        })
    }
})

module.exports = mongoose.model('Hotel', HotelSchema);

