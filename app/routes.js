const jwt = require('jsonwebtoken');
module.exports = function (app, passport) {

    let checkCookie = (cookie, res) => {
        jwt.verify(cookie, 'megaGeheimSecret', (err, data) => {
            if (err) {
                res.status(400).json(cookie);
            } else {
                console.log('succes');
                res.status(200).json({
                    user: data.user.local.email // TODO: later bij uitbreiding nagaan ook bij facebook/google...
                });
            }
        });
    };

    app.get('/testLogin', (req, res) => {
        const cookie = req.cookies.jwt;
        checkCookie(cookie, res);

    });

    // app.options('/*', (req, res) => {
    //     console.log(req.body);
    //     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    //     res.header('Access-Control-Allow-Origin', process.env.ORIGIN || 'http://localhost:8082');
    // });
    app.post('/testLoginIOS', (req, res) => {
        const cookie = req.body.cookie;
        // console.log(req.body);

        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Origin', process.env.ORIGIN || 'http://localhost:8081');
        checkCookie(cookie, res);
    });


    app.get('/', (req, res) => {
        let cookie = jwt.sign({
            user: req.user
        }, 'megaGeheimSecret');
        console.log('user: ' + req.user);
        console.log('jwt sign: ' + cookie);
        console.log(req);


        res.cookie('jwt', cookie, {
            httpOnly: true
        });
        res.status(200).json({
            'cookie': cookie
        });
    });

    app.get('/deleteCookie', (req, res) => {
        // res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
        res.clearCookie('jwt');
        res.status(200).json('delete');

    });

    app.get('/error', (req, res) => {

        // console.log(req.flash());

        res.status(400).json({
            'err': req.flash('err')[0]
        });
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