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

// app.use(corse());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Origin', process.env.ORIGIN || 'http://localhost:8082');
    next();
});

require('./app/routes.js')(app, passport);

const User = require('./app/models/user');

const Message = require('./app/models/msg');

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
    socket.broadcast.emit('hi');

    socket.on('send-msg', (msgData) => {
        console.log(msgData);

        let cookie = msgData.cookie;
        jwt.verify(cookie, 'megaGeheimSecret', (err, data) => {
            if (err) {
                console.log('iets raars met cookie...');

            } else {


                let user = data.user.local.email;
                console.log(user);

                let msg = new Message();
                msg.user = user;
                msg.message = msgData.msg;
                msg.save();

                io.emit('return', {
                    'msg': msgData.msg,
                    'user': user
                });

            }
        });

    });

});