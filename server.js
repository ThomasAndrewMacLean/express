const express = require('express');
// const request = require('request');
// var cheerio = require('cheerio');
const app = express();

// app.use(express.static('public'))
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(process.env.PORT || 8080, () => console.log('All is ok'))