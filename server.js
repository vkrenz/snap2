/**
* @author Victor Krenzel (102446176)
* @file server.js
* @desc WEB 322 Assignment
* ==> The main server file for the app
* ==> Handles the main route (/home)
* ==> Handles all the general app settings
* @date ❄️ November 11, 2022 ❄️
*/

// Express settings
const express = require('express')
const app = express()

// General Imports
const hbs = require('express-handlebars')
const path = require('path')

// Not important RN (for later use)
// const multer = require('multer')
// const cookieParser = require('cookie-parser')
// const cors = require('cors')

// General app settings
const favicon = require('serve-favicon')
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')))
app.use(express.static(path.join(__dirname, 'public')))

// Express Session Settings
const session = require('express-session')
app.use(session({
    secret: 'senecacollege-web322',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // secure: true,
        maxAge: 10 * 60000 // <== 10 Mins
    }
}))

// Parser settings
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// User Router Import
const user = require('./routes/user')
app.use('/user', user)

// Articles Router Import
const articles = require('./routes/articles')
app.use('/articles', articles)

// Blog Router Import
const blog = require('./routes/blog')
app.use('/blog', blog)

// View Engine Setup
app.set('view engine', '.hbs')
app.set('views', __dirname + '/views/partials')
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultView: 'default',
    layoutDir: __dirname + '/views/pages',
    partialsDir: __dirname + '/views/partials'
    // helpers: {
    //
    // }
}))

// Render index.hbs (main route)
app.get('/', (req, res) => res.redirect('/home'))

app.get('/home', (req, res) => {
    if(req.session.userLoggedIn) {
        console.log("User is logged in")
        res.render('index', {
            layout: false,
            username: req.session.user.username
        })
    }else{
        console.log("User is not logged in")
        res.render('index', { layout: false })
    }
})

// Define PORT
const PORT = process.env.PORT || 8080
const date = new Date().toLocaleString()
const onStart = port => console.log(`[${date}] Connected on localhost:${port}`)
app.listen(PORT, onStart(PORT))