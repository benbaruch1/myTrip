const Joi = require('joi');

module.exports.hotelSchema = Joi.object({ // Joi helps prevent invalid requests via backend. (Direcly via Postman)
    hotel: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({ // Joi helps prevent invalid requests via backend. (Direcly via Postman)
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})