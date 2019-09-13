var express = require('express');
var app = express();
var multer = require('multer')
var cors = require('cors');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');

//DB Modals
require('./models/user.modal')
// DB Config
const db = "mongodb://localhost:27017/docYourWays";

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
    password: undefined,
    gender: undefined,
    color: undefined,
    hasValue: 0,
};

mongoose.connect('mongodb://localhost:27017/docYourWays', { useNewUrlParser: true }, (err) => {
    if (!err) {
        console.log('MongoDB successfully connected')

    } else {
        console.log('error connecting db' + err)
    }
})

//VerifyKey
app.post('/verifyKey', async function (req, res) {
    var key = req.body.key

    // Search if key exist in DB
    await mongoose.connect(db, { userNewUrlParser: true }).then(() => {
        console.log('MongoDB Connected For Verify Key');
        var conn = mongoose.connection

        conn.collection('companies').findOne({
            key: key
        }, function (err, temp) {
            if (temp != null) {
                //exist 
                console.log('Key exist')
                res.status(200)
                res.json(temp)

            } else {
                console.log('Key Doesnot exist');
                //Doesnt exist 
                res.status(404).end();
            }
            conn.close();
        })
    }).catch(err => {
        console.log(err);
        console.log('\x1b[31m\x1b[1m MongoDB Not Connected');
        console.log()
    });
})

//Find User Name and Email
app.post('/isUnameOrEmailExist', async function (req, res) {
    var userModal = {
        uUserName: req.body.userName,
        uEmail: req.body.email,
    }
    //Creating Connection with mongoDB
    await mongoose.connect(db, { userNewUrlParser: true }).then(() => {
        console.log('MongoDB Connected For regDocYourWay');
        var conn = mongoose.connection;
        console.log(userModal)
        //Checking if UserName Or Email Already exist
        conn.collection('users').findOne({ $or: [{ uUserName: userModal.uUserName }, { uEmail: userModal.uEmail }] }, function (err, temp) {
            if (temp != null) {
                //exists
                if (temp.uUserName == userModal.uUserName) {
                    console.log("User Name Already Exists");
                    res.status(400).end();
                } else {
                    console.log("Email Already Exists");
                    res.status(404).end();
                }
            } else {
                //not exist
                console.log(" uName or Email Not Found");
                res.status(200).end();
            }

        });
        conn.close();

    });
})
//Register DocYourWay
app.post('/regDocYourWay', async function (req, res) {
    var userModal = {
        uName: req.body.name,
        uUserName: req.body.userName,
        uPassword: req.body.password,
        uEmail: req.body.email,
        uPhone: req.body.phone,
        uAddress: req.body.address,
        uCity: req.body.city,
        uState: req.body.state,
        UZip: req.body.zip
    }
    //Creating Connection with mongoDB
    await mongoose.connect(db, { userNewUrlParser: true }).then(() => {
        console.log('MongoDB Connected For regDocYourWay');
        var conn = mongoose.connection;
        console.log(userModal)

        conn.collection('users').insertOne(userModal, function (err, r) {

            if (!err) {

                console.log("Inserted ID : " + r.insertedId)
                res.status(200).end();
                conn.close();
            } else {
                console.log("error : " + err)
                res.status(400).end();
                conn.close();
            }
        })

    });
})
app.post('/login', async function (req, res) {

    var emailEntered = req.body.email;
    var passwordEntered = req.body.password;


    //Creating Connection with mongoDB
    await mongoose.connect(db, { userNewUrlParser: true }).then(() => {


        console.log('MongoDB Connected');

        var conn = mongoose.connection;

        // Checking if Email Already Exist      


        conn.collection('users').findOne({ uEmail: emailEntered }, function (err, temp) {
            if (temp != null) {
                //email found
                //check if password is equal to entered password...
                if (temp.uPassword === passwordEntered) {
                    res.body = temp;
                    res.write(JSON.stringify(res.body))
                    res.status(200).end();
                    console.log(JSON.stringify(res.body));
                } else {
                    // user entered an in correct password
                    console.log("Wrong Password entered");
                    res.status(404).end();
                }
            } else {
                //email not found
                console.log("Email Doesn't exsist in the DB");
                res.status(404).end();
            }
        });
    }).catch(err => {
        console.log(err);
        console.log('\x1b[31m\x1b[1m MongoDB Not Connected');
    });
})
// app.post('/upload', function (req, res) {
//     console.log(req.body.name);
//     upload(req, res, function (err) {
//         if (err instanceof multer.MulterError) {
//             return res.status(500).json(err)
//         } else if (err) {
//             return res.status(500).json(err)
//         }
//         app.locals.myVar = req.body.img.uri;
//         res.render('index', { myVar })
//     })
// });
app.post('/formData', async function (req, res) {



    var isSaveed = true;
    app.locals.userData.name = req.body.name,
        app.locals.userData.email = req.body.email,
        app.locals.userData.gender = req.body.gender,
        app.locals.userData.color = req.body.color,
        app.locals.userData.password = req.body.password,
        app.locals.userData.hasValue = 1,

        // connect to mongoDB
        await mongoose
            .connect(db)
            .then(() => {
                console.log('MongoDB Connected');
                var newUser = {
                    name: app.locals.userData.name,
                    email: app.locals.userData.email,
                    password: app.locals.userData.password,
                    gender: app.locals.userData.gender,
                };


                var conn = mongoose.connection;

                // Checking if Email Already Exist 

                conn.collection('users').findOne({ email: newUser.email }, function (err, temp) {
                    if (temp != null) {
                        //exists
                        console.log("User Already Exists");
                        res.status(404).end();
                    } else {
                        //not exist
                        conn.collection('users').insertOne(newUser);
                        console.log("User Added into Database");
                        res.status(200).end();
                    }

                });

            }
            )
            .catch(err => {
                console.log(err);
                console.log('\x1b[31m\x1b[1m MongoDB Not Connected');
            });


    res.render('index', { userData })




});
app.get('/upload', (req, res) => {
    console.log(req.query);

})
//Login 
app.post('/login', async function (req, res) {
    var userModal = {
        uEmail: req.body.email,
        uPassword: req.body.password,
    }
    await mongoose.connect(db, { useNewUrlParser: true }).then(() => {
        console.log('MongoDB Connected For Login');
        var conn = mongoose.connection;
        conn.collection('users').findOne({ email: userModal.email }) //If not found, no user with that email exists
            .exec(function (err, user) {
                if (userModal.uPassword === user.pwd) {
                    //If they don't match, user entered wrong password
                    res.status(200).end();
                    conn.close();
                }
                res.status(404).end();
                conn.close();
            });
    }).catch(err => {
        console.log(err)
    })
})


// server.get('/usersList', function (req, res) {
//     User.find({}, function (err, users) {
//         var userMap = {};

//         users.forEach(function (user) {
//             userMap[user._id] = user;
//         });

//         res.send(userMap);
//     });
// });

//get All packages
app.get('/getPackages', async function (req, res) {
    await mongoose.connect(db, { useNewUrlParser: true }).then(() => {
        console.log('MongoDB Connected For Get Packages');
        var conn = mongoose.connection;
        var found = false;
        var data = [];
        conn.collection('packages').find({}, async (err, packages) => {

            await packages.forEach(function (package) {

                data.push(package)
            })

            res.send(data)
        })

    }).catch(err => {
        console.log(err)
    })
})

