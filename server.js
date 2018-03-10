const express = require('express');
const app = express();

const mongoose = require('mongoose');
const passport = require('passport');
var flash = require('connect-flash');
const corse = require('cors');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://dbReadWrite:' + process.env.MONGO_DB_PW + '@cluster0-shard-00-00-ri0ro.mongodb.net:27017,cluster0-shard-00-01-ri0ro.mongodb.net:27017,cluster0-shard-00-02-ri0ro.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'process.env.SESSION_SECRET'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(corse({
    credentials: true
}));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', process.env.ORIGIN || 'http://localhost:8081');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Authorization, Range, Content-Type, Accept');
    next();
});

require('./app/routes.js')(app, passport);

const User = require('./app/models/user');
const Message = require('./app/models/msg');
const Game = require('./app/models/game');

app.copy('/', (req, res) => {
    User.find().exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                'message': err
            });
        });
});


app.copy('/game', (req, res) => {
    Game.find().exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                'message': err
            });
        });
});
app.delete('/game', (req, res) => {
    Game.find().remove({}).exec();
    res.status(200).json('del');
});

app.copy('/msg', (req, res) => {
    Message.find().exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                'message': err
            });
        });
});
app.delete('/', (req, res) => {
    User.find().remove({}).exec();
    res.status(200).json('del');
});

const server = app.listen(process.env.PORT || 8080, () => console.log('All is ok'));

var io = require('socket.io')(server);
//io.origins('*:*');
io.on('connection', (socket) => {
    console.log('new user');
    // console.log(socket);

    socket.broadcast.emit('hi');


    socket.on('sendMove', (a) => {
        //  console.log(a);
        const gameId = a.room;
        Game.findById(gameId).exec().then(x => {
            console.log(x);

            let from = a.data.split(':')[0];
            let to = a.data.split(':')[1];

            let lastMove = JSON.parse(JSON.stringify(x.moves.slice(-1)[0]));

            let f = lastMove[from];
            lastMove[to] = f;
            lastMove[from] = '';
            x.moves.push(lastMove);

            Game.findByIdAndUpdate(gameId, {
                'moves': x.moves
            }).exec();
            console.log(x.playerWhite);
            console.log(x.playerBlack);

            io.in(x.playerWhite).emit('return-private', {
                'board': lastMove,
                'gameId': gameId,
                'opponent': x.playerBlack,
                'nextPlayer': x.moves.length % 2 === 0 ? x.playerBlack : x.playerWhite
            });
            if (x.playerBlack) {
                io.in(x.playerBlack).emit('return-private', {
                    'board': lastMove,
                    'gameId': gameId,
                    'opponent': x.playerWhite,
                    'nextPlayer': x.moves.length % 2 === 0 ? x.playerBlack : x.playerWhite

                });
            }
        });


    });
    socket.on('subscribe', function (data) {
        console.log(data.room);
        console.log('subscribed');

        socket.join(data.room);
    });

    socket.on('unsubscribe', function (data) {
        console.log(data);
        console.log('unscub');

        socket.leave(data.room);
    });
    socket.on('send-msg', (msgData) => {
        console.log(msgData);

        let cookie = msgData.cookie;
        jwt.verify(cookie, 'megaGeheimSecret', (err, data) => {
            if (err) {
                console.log('iets raars met cookie...');

            } else {

                // console.log('data: ');
                // console.log(data);


                let user = data.user.local.email;
                // console.log(user);

                let msg = new Message();
                msg.user = user;
                msg.message = msgData.msg;
                msg.save().then(m => {

                    io.emit('return', {
                        'message': msgData.msg,
                        'user': user,
                        'createdAt': m.createdAt
                    });
                });

            }
        });

    });

});