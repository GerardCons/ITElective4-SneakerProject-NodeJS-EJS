var express = require('express');
var app = express();

app.set('view engine', 'ejs');

const fs = require('firebase-admin');

const serviceAccount = require('./itelective4-firebase-key.json');

const port = 8080

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/images', express.static(__dirname + 'public/images'))

fs.initializeApp({
    credential: fs.credential.cert(serviceAccount)
});

const db = fs.firestore();
const itemColl = db.collection('items');

app.get('/', async function (req, res) {
    const items = await itemColl.get();
    let data = {
        url: req.url,
        itemData: items.docs,
        array: [
            { fname: "Dodong", lname: "Laboriki" }
        ],
    }
    res.render('pages/index', data);
});

app.get('/cart',(req,res) => {
    res.render('pages/cart');
});

app.listen(port);