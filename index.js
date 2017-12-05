var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))