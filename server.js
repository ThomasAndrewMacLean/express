const express = require('express');
// const request = require('request');
// var cheerio = require('cheerio');
const app = express();
var morgan = require('morgan')
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const Product = require('./models/product')



mongoose.connect('mongodb://dbReadWrite:' + process.env.MONGO_DB_PW + '@cluster0-shard-00-00-ri0ro.mongodb.net:27017,cluster0-shard-00-01-ri0ro.mongodb.net:27017,cluster0-shard-00-02-ri0ro.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin')


app.use(morgan('dev'))
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.copy('/', (req, res, next) => {
    res.status(200).json({
        'message': 'test'
    })
})


app.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then(doc => {
            console.log('from db:' + doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({
                    messange: 'No valid product found'
                })
            }

        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                "err": err
            })

        })

})

// app.use(express.static('public'))
app.get('/', (req, res) => {
    Product.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        }).catch(err => {
            res.status(500).json({
                'message': err
            })
        })
})

app.post('/', (req, res, next) => {
    // console.log(req)

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then(result => {
            console.log(result);
            res.status(201).json({
                result
            })

        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                "err": err
            })

        })


})

app.listen(process.env.PORT || 8080, () => console.log('All is ok'))