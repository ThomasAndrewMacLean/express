const jwt = require('jsonwebtoken');
module.exports = function (app, passport) {

    app.get('/', (req, res) => {

        // console.log(req);

        console.log('ok!');

        res.status(200).json(req.flash());
    });

    app.get('/error', (req, res) => {

        console.log(req.flash());

        res.status(400).json('not good');
    });

    app.get('/userinfo', hasToken, (req, res) => {
        jwt.verify(req.token, 'megaGeheimSecret', (err, data) => {
            if (err) {
                console.log('err');

                res.status(403).json({
                    'err': err
                });
            } else {
                console.log('succes');

                res.status(200).json({
                    text: 'allrighty',
                    data: data
                });
            }
        });

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
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);


    if (req.flash('jwt')) {
        console.log(req.flash('jwt'));

    }

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        console.log('ok');

        next();
    } else {
        res.status(403).json('no token');
    }
}