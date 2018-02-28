const express = require('express');
const app = express();

const mongoose = require('mongoose');
const passport = require('passport');
var flash = require('connect-flash');




var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');



//const Product = require('./app/models/product');



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

require('./app/routes.js')(app, passport);



const User = require('./app/models/user');
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


// app.get('/:productId', (req, res, next) => {
//     const id = req.params.productId;
//     Product.findById(id)
//         .exec()
//         .then(doc => {
//             console.log('from db:' + doc);
//             if (doc) {
//                 res.status(200).json(doc);
//             } else {
//                 res.status(404).json({
//                     messange: 'No valid product found'
//                 });
//             }

//         }).catch((err) => {
//             console.log(err);
//             res.status(500).json({
//                 'err': err
//             });

//         });

// });

// // app.use(express.static('public'))
// app.get('/', (req, res) => {
//     Product.find()
//         .exec()
//         .then(docs => {
//             res.status(200).json(docs);
//         }).catch(err => {
//             res.status(500).json({
//                 'message': err
//             });
//         });
// });

// app.post('/', (req, res, next) => {
//     // console.log(req)

//     const product = new Product({
//         _id: new mongoose.Types.ObjectId(),
//         name: req.body.name,
//         price: req.body.price
//     });
//     product.save().then(result => {
//         console.log(result);
//         res.status(201).json({
//             result
//         });

//     })
//         .catch((err) => {
//             console.log(err);
//             res.status(500).json({
//                 'err': err
//             });

//         });


// });

app.listen(process.env.PORT || 8080, () => console.log('All is ok'));