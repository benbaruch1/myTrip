const User = require('../models/user');


module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.createUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to myTrip');
            res.redirect('/hotels');
        });
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back to myTrip!');
    const redirectURL = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectURL);
};

module.exports.logoutUser = async (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out successfully!');
        res.redirect('/');
    });
};

