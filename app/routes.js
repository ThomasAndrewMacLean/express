module.exports = function (app, passport) {

    app.get('/', (req, res) => {
        res.status(200).json('test');
    });

    app.get('/signup', (req, res) => {
        res.status(200).json('not good');
    });

    app.get('/userinfo', hasToken, (req, res) => {
        res.status(200).json('user');
    });

    app.post('/temp', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


};

function hasToken(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(403).json('not authenticated');
    }
}