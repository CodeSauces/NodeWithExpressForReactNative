var express = require('express');
var app = express();
var multer = require('multer')
var cors = require('cors');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
// DB Config
const db = require('./config/keys').mongoURI;




app.use(cors())
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
//setting storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})


var upload = multer({ storage: storage }).single('file')

const port = 8000;

//setting ejs
app.set('view engine', 'ejs');

//Public folder
app.use(express.static('./public'))

app.get('/', (req, res) => res.render('index'));

app.listen(port, () => console.log('server started on port 8000'));

app.locals.myVar = 0;
app.locals.userData = {
    name: undefined,
    email: undefined,
    gender: undefined,
    color: undefined,
    hasValue: 0,
};


app.post('/upload', function (req, res) {
    console.log(req.body.name);
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        app.locals.myVar = req.body.img.uri;
        res.render('index', { myVar })
    })
});

app.post('/formData', function (req, res) {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }

        app.locals.userData.name = req.body.name,
            app.locals.userData.email = req.body.email,
            app.locals.userData.gender = req.body.gender,
            app.locals.userData.color = req.body.color,
            app.locals.userData.hasValue = 1,
            // connect to mongoDB
            mongoose
                .connect(db)
                .then(() => {
                    console.log('MongoDB Connected');
                    var ObjectID = require('mongodb').ObjectID;

                    var newUser = {
                        name :  app.locals.userData.name,
                        email :  app.locals.userData.email,
                        gender :  app.locals.userData.gender,
                    };

                    var conn = mongoose.connection;
                    conn.collection('users').insertOne(newUser);
                })
                .catch(err => {
                    console.log(err);
                    console.log('\x1b[31m\x1b[1m MongoDB Not Connected');
                });



        res.render('index', { userData })

    })
});

app.get('/upload', (req, res) => {
    console.log(req.query);

})