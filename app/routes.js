//@ts-check

const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Game = require('./models/game');
const Message = require('./models/msg');
const gameHelper = require('./gameHelper');

module.exports = function (app, passport) {

    let getUserNameFromCookie = (cookie, res) => {
        return jwt.verify(cookie, 'megaGeheimSecret', (err, data) => {
            if (err) {
                res.status(400).json(cookie);
            } else {
                console.log('data: ');
                console.log(data);


                return data.user.local.email;
            }
        });
    };
    app.post('/newGame', (req, res) => {
        let cookie = req.body.cookie;
        //   console.log('user: ' + cookie);
        jwt.verify(cookie, 'megaGeheimSecret', (err, data) => {
            if (err) {
                res.status(400).json(cookie);
            } else {
                let pl = data.user.local.email;
                let game = new Game();
                game.playerWhite = pl;
                //   game.moves.push(Game.pieces[0]);
                game.moves.push(gameHelper.getNewBoard());

                game.save().then(g => {
                    res.status(200).json({
                        'game': g
                    });
                });
            }
        });
    });
    app.post('/getOpenGames', (req, res) => {
        let cookie = req.body.cookie;
        jwt.verify(cookie, 'megaGeheimSecret', (err, data) => {
            if (err) {
                res.status(400).json(cookie);
            } else {
                const user = data.user.local.email;
                Game.find({
                    $or: [{
                        'playerWhite': user
                    }, {
                        'playerBlack': user
                    }]
                }).exec().then(g => {
                    return res.send(g.map(p => {


                        return {
                            '_id': p._id,
                            'playerWhite': p.playerWhite,
                            'playerBlack': p.playerBlack
                        };

                    }).filter(x => {
                        return x.playerBlack;
                    }));
                });
            }
        });
    });
    app.post('/addPlayer', (req, res) => {
        let cookie = req.body.cookie;
        let gameId = req.body.gameId;
        //   console.log('user: ' + cookie);
        jwt.verify(cookie, 'megaGeheimSecret', (err, data) => {
            if (err) {
                res.status(400).json(cookie);
            } else {
                console.log(data.user.local.email);

                Game.findById(gameId).then(g => {
                    if (!g.playerBlack && g.playerWhite !== data.user.local.email) {
                        Game.findByIdAndUpdate(gameId, {
                            playerBlack: data.user.local.email
                        }, {
                            new: true
                        },

                            // the callback function
                        (err, game) => {
                            // Handle any possible database errors
                            if (err) return res.status(500).send(err);
                            console.log('update???');

                            return res.status(200).json(game);
                        });
                    } else {
                        if (g.playerBlack === data.user.local.email || g.playerWhite === data.user.local.email) {
                            return res.status(200).json(g);
                        } else {

                            return res.send('playerblack is already filled');
                        }
                    }
                });


            }
        });
    });
    app.post('/getMessages', (req, res) => {
        let cookie = req.body.cookie;
        //
        jwt.verify(cookie, 'megaGeheimSecret', (err) => {
            if (err) {
                res.status(400).json(cookie);
            } else {
                Message.find().sort('-createdAt').limit(10).exec().then(m => {

                    res.status(200).json(m);
                });
            }
        });
    });
    app.get('/testLogin', (req, res) => {
        const cookie = req.cookies.jwt;
        let email = getUserNameFromCookie(cookie, res);
        res.status(200).json({
            user: email // TODO: later bij uitbreiding nagaan ook bij facebook/google...
        });
    });
    app.post('/testLoginIOS', (req, res) => {
        const cookie = req.body.cookie;

        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Origin', process.env.ORIGIN || 'http://localhost:8081');
        let email = getUserNameFromCookie(cookie, res);
        res.status(200).json({
            user: email // TODO: later bij uitbreiding nagaan ook bij facebook/google...
        });
    });
    app.get('/', (req, res) => {


        if (req.user) {



            let cookie = jwt.sign({
                user: req.user
            }, 'megaGeheimSecret');

            res.cookie('jwt', cookie, {
                httpOnly: true
            });
            res.status(200).json({
                'cookie': cookie
            });
        } else {
            console.log('no session IOS :(');
            let userId;
            for (const sess in req.sessionStore.sessions) {
                if (req.sessionStore.sessions[sess].includes('passport'))
                    userId = JSON.parse(req.sessionStore.sessions[sess]).passport.user;
            }
            console.log('userId: ' + userId);
            if (userId) {

                User.findById(userId).then(user => {
                    console.log('user: ' + user);

                    let cookie = jwt.sign({
                        user: user
                    }, 'megaGeheimSecret');
                    res.status(200).json({
                        'cookie': cookie
                    });
                });
            } else {
                res.status(404).json({
                    'err': 'no user found'
                });
            }
        }


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
    app.post('/particle', (req, res) => {
        console.log(req.body);
        res.status(200).json({
            'hello': 'jowkes'
        });
    });
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