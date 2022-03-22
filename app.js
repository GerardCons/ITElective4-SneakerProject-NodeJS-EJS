var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(bodyParser.json());
app.use(cors())

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

app.get('/cart',async (req,res) => {
    const items = await db.collection('cart').get();
    var total = 0
    var length = items.docs.length
    items.docs.forEach(item => {
        total += item.data()['subtotal']
    })
    let data = {
        items : items.docs,
        total,
        length
    }    
    res.render('pages/cart', data);
});
app.post('/cart', bodyParser.urlencoded({ extended: false }), async(req, res) => {
    await db.collection('cart').add(req.body)
    const items = await db.collection('cart').get();
    var total = 0
    items.docs.forEach(item => {
        total += item.data()['subtotal']
    })
    let data = {
        items : items.docs,
        total,
        length
    }     
    res.render('pages/cart', data);
})
app.put('/cart/:id', bodyParser.urlencoded({ extended: false }), async(req, res) => {    
    var doc = await db.collection('cart').doc(req.params.id).get();    
    if(req.body.operation == 'add'){
        var newQty = doc.data()['qty'] + 1;
        await db.collection('cart').doc(req.params.id).set({
            qty: newQty,
            subtotal : doc.data()['price'] * newQty
        }, { merge: true })
    }
    else{
        var newQty = doc.data()['qty'] - 1;
        await db.collection('cart').doc(req.params.id).set({
            qty: newQty,
            subtotal : doc.data()['price'] * newQty
        }, { merge: true })
    }
    const items = await db.collection('cart').get();
    var total = 0
    items.docs.forEach(item => {
        total += item.data()['subtotal']
    })
    let data = {
        items : items.docs,
        total,
        length
    }         
    res.render('pages/cart', data)
})

app.delete('/cart/:id', bodyParser.urlencoded({ extended: false }), async(req, res) => {    
   await db.collection('cart').doc(req.params.id).delete()
    const items = await db.collection('cart').get();
    var total = 0
    items.docs.forEach(item => {
        total += item.data()['subtotal']
    })
    let data = {
        items : items.docs,
        total,
        length
    }        
    res.render('pages/cart', data)
})

app.listen(port);