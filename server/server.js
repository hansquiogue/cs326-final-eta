//--------------------Server--------------------

// Required libraries
import * as _express from 'express';
import expressSession from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const express = _express['default'];
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 8080;

// Session configuration
const session = {
    secret : process.env.SECRET || 'SECRET-CHANGE-TODO', 
    resave : false,
    saveUninitialized: false
};

//--------------------Application--------------------

// App configuration
app.use(expressSession(session));

// Allows JSON and URLencoded data
app.use(express.json()); 
app.use(express.urlencoded({'extended' : true}));

/*** Application endpoints ***/ 

// Get request to homepage
app.get('/', (req, res) => {
    res.sendFile(path.resolve('client/homepage/homepage.html'));
});

// Allows homepage files to be used
app.use('/', express.static(path.join(__dirname, '/../client/homepage')));

// Get request to login page
app.get('/login', (req, res) => {
    res.sendFile(path.resolve('client/login-register/signin.html'));
});

// Post request when user attempts to login
app.post('/login', (req, res) => {
    const user = req.body['username'];
    const pass = req.body['password'];

    // TODO: Login stuff (Authenticate, etc.)
    // If login stuff goes okay, redirects to the user's gallery page

    res.redirect('/gallery/user/' + user);
});

// Allows login files to be used
app.use('/login', express.static(path.join(__dirname, '/../client/login-register')));

// Get request to registration page
app.get('/register', (req, res) => {
    res.sendFile(path.resolve('client/login-register/register.html'));
});

// Post request when user attempts to register
app.post('/register', (req, res) => {
    const user = req.body['username'];
    const email = req.body['email'];
	const pass = req.body['password'];
    const confPass = req.body['confirm-password'];

    // TODO: Register stuff goes here (Check if user in database, passwords the same, etc.)
    // If register stuff goes okay, redirects to login page (Display message?)

    res.redirect('/login');
});

// Allows register files to be used
app.use('/register', express.static(path.join(__dirname, '/../client/login-register')));

// TODO: Get request that submits a user's characters
app.get('/user/:user', (req, res) => {

});

// Get request for a user's gallery page
app.get('/gallery/user/:user/', (req, res) => {
    res.sendFile(path.resolve('client/character-gallery/selector.html'));
});

// Allows gallery files to be used
app.use('/gallery/user/:user', express.static(path.join(__dirname, '/../client/character-gallery')));

// Get request for a user's character
app.get('/gallery/user/:user/character/:character', (req, res) => {
    res.sendFile(path.resolve('client/character-sheet/character-sheet.html'));
});

// Allows character files to be used
app.use('/gallery/user/:user/character/:character', express.static(path.join(__dirname, '/../client/character-sheet')));

// TODO: Other endpoints!
//

// Paths that do not exis
// TODO: Make error page?
app.get('*', (req, res) => {
    res.send('You seem to be a bit lost adventurer...');
});

app.listen(port, () => {
    console.log(`App now listening at port ${port}`);
});