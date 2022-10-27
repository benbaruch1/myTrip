if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Hotel = require('./models/hotel');
const User = require('./models/user');


const usersRoutes = require('./routes/users');
const hotelsRoutes = require('./routes/hotels');
const reviewsRoutes = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo');

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/myTrip';
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPENED!")
    })
    .catch(err => {
        console.log("ERROR IN MONGO CONNECTION!")
        console.log(err)
    })

const app = express();


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

const secret = process.env.SECRET || 'benbenbenben';

const store = MongoDBStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 3600,
    crypto: {
        secret
    }
});


store.on("error", function (e) {
    console.log("Session store error", e)
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user; // when user logged in, the data provided. until then, its undefined.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', usersRoutes);
app.use('/hotels', hotelsRoutes);
app.use('/hotels/:id/reviews', reviewsRoutes);


app.get('/', async (req, res) => {
    const randomHotels = await Hotel.aggregate([ // get 3 random hotels from db
        { $sample: { size: 3 } }
    ]);
    const hotels = Object.assign({}, randomHotels); // array to object.
    res.render('home', { hotels });
})


app.use((err, req, res, next) => { // Basic error handler
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err, statusCode });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`SERVING ON PORT ${port}!`)
})

