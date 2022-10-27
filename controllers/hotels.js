const Hotel = require('../models/hotel');
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const allHotels = await Hotel.find({})
    res.render('hotels/index', { allHotels });
}

module.exports.renderNewForm = (req, res) => {
    res.render('hotels/new');
};

module.exports.createHotel = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hotel.location,
        limit: 1
    })
        .send()
    const newHotel = new Hotel(req.body.hotel);
    newHotel.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newHotel.author = req.user._id; // save the user id of owner
    newHotel.geometry = geoData.body.features[0].geometry;
    await newHotel.save();
    req.flash('success', 'Successfully made a new hotel.');
    res.redirect(`/hotels/${newHotel._id}`)
};

module.exports.showHotel = async (req, res) => {
    const { id } = req.params;
    let hotel, Id_error;
    try {
        hotel = await Hotel.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    }
    catch (err) {
        if (err.kind === 'ObjectId') {
            Id_error = 1;
        }
    }
    if (!hotel || Id_error == 1) {
        req.flash('error', 'Cannot find that hotel.');
        res.redirect('/hotels');
    }
    res.render('hotels/show', { hotel });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    let hotel, Id_error;
    try {
        hotel = await Hotel.findById(id);
    }
    catch (err) {
        if (err.kind === 'ObjectId') {
            Id_error = 1;
        }
    }
    if (!hotel || Id_error == 1) {
        req.flash('error', 'Cannot find that hotel.');
        res.redirect('/hotels');
    }
    res.render('hotels/edit', { hotel });
};

module.exports.updateHotel = async (req, res) => {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndUpdate(id, req.body.hotel);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hotel.images.push(...imgs); // spread the images from array to items...
    await hotel.save();
    if (req.body.deleteImages) { // delete images from db and cloud
        for (let img of req.body.deleteImages) {
            await cloudinary.uploader.destroy(img);
        }
        await hotel.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated hotel.');
    res.redirect(`/hotels/${hotel._id}`)
};

module.exports.deleteHotel = async (req, res) => {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hotel.');
    res.redirect(`/hotels`)
};