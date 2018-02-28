module.exports = function (app, passport) {

    app.get('/', (req, res) => {
        res.status(200).json('test');
    });

    app.get('/error', (req, res) => {

        console.log(req.sessionStore);

        res.status(400).json('not good');
    });

    app.get('/userinfo', hasToken, (req, res) => {
        res.status(200).json('user');
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/error',
        failureFlash: true
    }));
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/error',
        failureFlash: true
    }));

};

function hasToken(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(403).json('not authenticated');
    }
}