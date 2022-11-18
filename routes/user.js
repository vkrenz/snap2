/**
 * @file user.js
 * @desc ✨ Where all the magic happens ✨
 * ==> user database (mongoDB)
 * ==> user registration
 * ==> user login
 * ==> user dashboard
 * ==> Administrator access
 */

const router = require('express').Router()

// General Settings
const fs = require('fs')
const path = require('path')
require('dotenv/config')

// Mongo DB Settings
const mongoose = require('mongoose')
const url = "mongodb+srv://dbVkrenzel:QnzXuxUfGkRec92j@senecaweb.53svswz.mongodb.net/web322"
const mongooseConnection = mongoose.connect(url)
// const defaultPFP = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
// const defaultCoverPhoto = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"

// MongoDB - Define User Schema
const User = mongoose.model("users", new mongoose.Schema({
    "profilePhoto": String,
    "coverPhoto": {
        "data": Buffer,
        "contentType": String,
    },
    "createdAt": {
        "type": Date,
        "default": new Date().toLocaleString(),
    },
    "userType": {
        "type": String,
        "default": "user"
    },
    "username": {
        "type": String,
        "required": true,
        "unique": true
    },
    "email": {
        "type": String,
        "required": true,
        "unique": true
    },
    "password": {
        "type": String,
        "required": true
    },
    "fullName": {
        "type": String,
        "required": true
    },
    "phoneNumber": {
        "type": String, 
        "default": "N/A"
    },
    "companyName": {
        "type": String,
        "required": true,
        "default": "Krusty Krab"
    },
    "country": String,
    "city": String,
    "postalCode": String
    })
)

User.exists({username: "admin-vkrenzel"}, (err, user) => {
    if(err) {
        console.log(err)
    } else {
        console.log('[Exists] Admin User:', user)
        if(!user) {
            // Create admin user
            console.log("Admin User not found! Creating one...")
            const adminUser = new User({
                userType: "admin",
                username: "admin-vkrenzel",
                email: "admin@senecacollege.ca",
                password: "admin",
                fullName: "Victor Krenzel",
                phoneNumber: "1112223333",
                companyName: "Seneca College",
                country: "Canada",
                city: "Toronto",
                postalCode: "M2M 1G1"
            }).save().then(() => {
                console.log("Admin User Created!")
            })
        }
    }
})

// Express Validator
const { check, validationResult } = require('express-validator')

router.get('/', (req, res) => {
    if(req.session.userLoggedIn) {
        res.redirect(`/user/dash/${req.session.user.username}`)
    }else{
        res.redirect('/user/login')
    }
})

router.get('/register', (req, res) => {
    res.render('register', { layout: false })
})

router.get('/register/:username', (req, res) => {
    const passedUsername = req.params.username
    console.log(passedUsername)
    res.render('register', {
        layout: false,
        passedUsername: passedUsername
    })
})

/**
 * @function ROUTER-POST-REGISTER
 * @desc "localhost:8080/user/auth/register"
 * ==> Validates user input, @see registerValidationRules,
 * ==> Checks if a user exists in mongoDB, if not...
 * ==> Creates a new user in mongoDB collection 'Users_Test',
 * ==> Redirects to user dashboard @see /user/dash/:username
 */

// Multer Settings 
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'upload'))
    },
    filename: (req, file, cb) => {
        console.log('[File]:', file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

const registerValidationRules = [
    check('username')
        .isLength({ min: 3})
        .withMessage('Username must be minimum 3 characters'),
    check('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email is invalid'),
    check('password')
        .isLength({min: 4, max: 16})
        .withMessage('Password must be between 4 to 16 characters'),
    check('confirm_password')
        .trim()
        .isLength({min: 4, max: 16})
        .withMessage('Password must be between 4 to 16 characters')
        .custom(async (confirm_password, {req}) => {
            const password = req.body.password
            if(password !== confirm_password) {
                throw new Error('Passwords must be the same')
            }
        })
]

router.post('/auth/register', 
upload.single('profilePhoto'),
registerValidationRules, 
(req, res) => {
    const errors = validationResult(req)
    const err = errors.array()
    const { username, email, password, confirm_password, fullName, phoneNumber, companyName, country, city, postalCode  } = req.body
    if (!errors.isEmpty()) {
        console.log(errors)
        renderRegisterPage(res, err, username, email, password, confirm_password, fullName, phoneNumber, companyName, country, city, postalCode)
        // console.log(`password: ${password} confirm_password: ${confirm_password}`)
    }else{
        // Validate username
        if(password == username) {
            const Err = 'Password cannot match username'
            console.log(Err)
            renderRegisterPageErr(res, Err, err, username, email, password, confirm_password, fullName, phoneNumber, companyName, country, city, postalCode)
        }else{
            User.findOne({username: username}, (Err, user) => {
                if(Err) {
                    console.log(Err)
                    renderRegisterPageErr(res, Err, err, username, email, password, confirm_password, fullName, phoneNumber, companyName, country, city, postalCode)  
                }else{
                    if(user != null) {
                        console.log(`Username: ${username} already exists bro`)
                        Err = `Looks like '<strong>${username}</strong>' already exists. <a href="/user/login/${username}" class="alert-link">Log In?</a>`
                        console.log(user)
                        renderRegisterPageErr(res, Err, err, username, email, password, confirm_password, fullName, phoneNumber, companyName, country, city, postalCode)        
                    }else{
                        console.log(`${username} does not exist. Creating new user...`)
                        const profilePhoto = {
                            data: fs.readFileSync(path.join(__dirname, '..', 'public', 'upload', req.file.filename)),
                            contentType: 'image/png'
                        }
                        // Create a new user in web322.users
                        new User({
                            profilePhoto: `/upload/${req.file.filename}`,
                            // coverPhoto: {
                            //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                            //     contentType: 'image/png'
                            // },
                            username: username,
                            email: email,
                            password: password,
                            fullName: fullName,
                            phoneNumber: phoneNumber ? null : phoneNumber,
                            companyName: companyName,
                            country: country ? null : country,
                            city: city ? null : city,
                            postalCode: postalCode ? null : city
                        }).save().then(() => {
                            console.log(`New User (${username})`)
                        }).catch(err => {
                            console.log(`Error: ${err}`)
                        })
                        const newUser = {
                            profilePhoto: profilePhoto,
                            username: username,
                            email: email,
                            password: password,
                            fullName: fullName,
                            phoneNumber: phoneNumber ? null : phoneNumber,
                            companyName: companyName,
                            country: country ? null : country,
                            city: city ? null : city,
                            postalCode: postalCode ? null : city
                        }
                        // Pass user data to req.session
                        req.session.user = newUser
                        // Log user in
                        req.session.userLoggedIn = true
                        // Redirect to the dashboard
                        res.redirect(`/user/dash/${req.session.user.username}`)
                    }
                }
            })
        }
    }
})

const renderRegisterPage = (res, err, username, email, password, confirm_password, fullName, phoneNumber, companyName, country, city, postalCode) => {
    console.log('NO ERR RENDERED')
    res.render('register', {
        layout: false,
        err: err,
        username: username,
        email: email,
        password: password,
        confirm_password: confirm_password,
        fullName: fullName,
        phoneNumber: phoneNumber,
        companyName: companyName,
        country: country,
        city: city,
        postalCode: postalCode
    })
}

const renderRegisterPageErr = (res, Err, err, username, email, password, confirm_password, fullName, phoneNumber, companyName, country, city, postalCode) => {
    console.log('ERR RENDERED')
    res.render('register', {
        layout: false,
        Err: Err,
        err: err,
        username: username,
        email: email,
        password: password,
        confirm_password: confirm_password,
        fullName: fullName,
        phoneNumber: phoneNumber,
        companyName: companyName,
        country: country,
        city: city,
        postalCode: postalCode
    })
}

router.get('/login', (req, res) => {
    if(req.session.userLoggedIn) {
        res.redirect(`/user/dash/${req.session.user.username}`)
    }else{
        var error = req.query.error
        if(error) {
            if(error == 1) {
                res.render('login', {
                    layout: false,
                    Err: '<strong>You need to login to view this content.</strong> Please log in.'
                })
            }
        }else{
            res.render('login', {
                layout: false,
            })       
        }
    }
})

router.get('/login/:username', (req, res) => {
    const passedUsername = req.params.username
    console.log(passedUsername)
    res.render('login', {
        layout: false,
        passedUsername: passedUsername
    })
})

router.get('/auth/logout', (req, res) => {
    if(req.session) {
        req.session.destroy(err => {
            if(err) {
                res.send('Unable to logout')
            }
        })
    }
    //Then...
    res.redirect('/user/auth/logout?status=success')
})

router.get('/auth/logout?status=success', (req, res) => {
    console.log("Logged Out")
    res.render('logout', {layout: false})
}) 

/**
 * @function ROUTER-POST-LOGIN
 * @desc "localhost:8080/user/auth/login"
 * ==> Validates user input, @see loginValidationRules,
 * ==> Checks if a user exists in mongoDB,
 * ==> Checks if password matches database password,
 * ==> Redirects to user dashboard @see /user/dash/:username
 */

const loginValidationRules = [
    check('username').isLength({ min: 3}).withMessage('Username must be minimum 3 characters'),
    check('password').isLength({ min: 5}).withMessage('Password must be minimum 5 characters long')
]

router.post('/auth/login', loginValidationRules, (req, res) => {
    const errors = validationResult(req)
    const err = errors.array()
    const { username, password } = req.body
    if (!errors.isEmpty()) {
        console.log(errors)
        renderLoginPage(res, err, username, password)
    }else{
        // Validate username first...
        User.findOne({username: username}, (Err, user) => {
            if(Err) {
                console.log(Err)
                renderLoginPageErr(res, Err, err, username, password)
            }else if(user != null) {
                // Validate if password matches...
                if(password == user.password) {
                    console.log('Password matches! :D')
                    // Log user in
                    req.session.userLoggedIn = true
                    // Pass user data to req.session
                    req.session.user = user
                    req.session.isAdmin = user.userType == 'admin' ? true : false
                    res.redirect(`/user/dash/${username}`)
                }else{
                    console.log('Password doesn\'t match :(')
                    Err = 'Incorrect password'
                    renderLoginPageErr(res, Err, err, username, password)
                    // console.log(`input: ${password}, user: ${user.password}`)
                }
            }else{
                Err = `'<strong>${username}</strong>' does not exist. <a href="/user/register/${username}" class="alert-link">Sign Up?</a>`
                console.log(`${username} does not exist`)
                renderLoginPageErr(res, Err, err, username, password)
            }
        })
    }
})

const renderLoginPageErr = (res, Err, err, username, password) => {
    console.log("ERR RENDERED")
    res.render('login', {
        layout: false,
        Err: Err,
        err: err,
        username: username,
        password: password
    })
}

const renderLoginPage = (res, err, username, password) => {
    console.log("NO ERR RENDERED")
    res.render('login', {
        layout: false,
        err: err,
        username: username,
        password: password
    })
}

/**
 * @function ROUTER-GET-USER-DASHBOARD
 * @desc 'localhost:/user/dash/username'
 * ==> Check if user exists in mongoDB,
 * ==> Render a user-specific dashboard page
 */

router.get('/dash', (req, res) => {
    if(req.session.userLoggedIn) {
        res.redirect(`/user/dash/${req.session.user.username}`)
    }else{
        res.redirect('/user/login')
    }
})

router.get('/dash/:username', (req, res) => {
    // Do not allow random people onto your dash
    if(req.session.userLoggedIn) {
        const username = req.params.username
        // Then check if the /:username user actually exists
        User.exists({username: username}, (err, user) => {
            if(err) {
                console.log(err)
                res.redirect('/user/login')
                // res.send(err, ':(')
            }
            // else if(user == null){
            //     const Err = `'<strong>${username}</strong>' does not exist. <a href="/user/register/${username}" class="alert-link">Sign Up?</a>`
            //     res.render('login', {
            //         layout: false,
            //         Err: Err
            //     })
            // }
            else{
                User.findOne({username: username}, (err, user) => {
                    if(err) {
                        console.log(err)
                        res.redirect('/user/login')
                    }else{
                        // If the /:user exists then...
                        if(req.session.user.username == username) {
                            // Only show the logged in user their dashboard.
                            var fullLocation

                            res.render('dash', { 
                                layout: false ,
                                username: user.username,
                                email: user.email,
                                fullName: user.fullName,
                                profilePhoto: user.profilePhoto,
                                phoneNumber: user.phoneNumber,
                                companyName: user.companyName,
                                country: user.country,
                                city: user.city,
                                postalCode: user.postalCode,
                                isAdmin: req.session.isAdmin,
                                fullLocation: fullLocation
                            })
                        }else{
                            res.redirect(`/user/dash/${req.session.user.username}`)
                        }
                    }
                })
            }
        })
    }else{
        res.redirect('/user/login')
    }
})

module.exports = router, mongooseConnection