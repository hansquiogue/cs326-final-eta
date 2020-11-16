//--------------------Server--------------------

// Required libraries
import express from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: __dirname + '/.env' });
const LocalStrategy = passportLocal.Strategy;
const app = express();
const port = process.env.PORT || 8080;

// Session configuration
const session = {
    secret : process.env.SECRET || 'SECRET-CHANGE-TODO', 
    resave : false,
    saveUninitialized: false
};

const strategy = new LocalStrategy(
    async (username, password, done) => {
    // No user exists
    if (!userExists(username)) {
	    return done(null, false, { 'message' : 'Wrong username' });
    }
    // Invalid password
	if (!validatePass(username, password)) {
	    // Delay to prevent brute forcing pass attempts
	    await new Promise((r) => setTimeout(r, 2000));
	    return done(null, false, { 'message' : 'Wrong password' });
    }
	// success!
	// should create a user object here, associated with a unique identifier
	return done(null, username);
});

//--------------------Application--------------------

// App configuration
app.use(expressSession(session));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// Convert user object to a unique identifier
passport.serializeUser((user, done) => {
    done(null, user);
});

// Convert a unique identifier to a user object
passport.deserializeUser((uid, done) => {
    done(null, uid);
});

// Allows JSON and URLencoded data
app.use(express.json()); 
app.use(express.urlencoded({'extended' : true}));


//--- Temporary user storage (TODO: Replace/remove with MongoDB)
// Type: user = { user, *encrypted* pass, email, characters[] }
const database = [];
//--------------------------------------------

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
app.post('/login', 
    // Uses username/password authentication
    passport.authenticate('local', 
    {   
        failureRedirect : '/login?attempt=failure',
    // Successful and redirects to gallery
    }), 
    (req, res) => {
        const user = req.body['username'];
        res.redirect('/gallery/user/' + user);
    }
);

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

    // TODO: (Helper function) Regex to see if fields are valid

    if (pass !== confPass) {
        // TODO: Error message
        res.redirect('/register');
    // Cannot add new user
    } else if (!addUser(user, pass, email)) {
        // TODO: Error message
        res.redirect('/register');
    // Can add new user
    } else {
        // TODO: Succesful registration page
        res.redirect('/login');
    }
});

// Allows register files to be used
app.use('/register', express.static(path.join(__dirname, '/../client/login-register')));

// TODO: Get request that submits a user's characters
// Will programmatically generate gallery page
app.get('/user/:user', checkLoggedIn, (req, res) => {

});

// Get request and redirects user to their own page
app.get('/gallery', checkLoggedIn, (req, res) => {
    res.redirect('/gallery/user/' + req.user);
});

// Get request for a user's gallery page
app.get('/gallery/user/:user/', checkLoggedIn, (req, res) => {
    // Verify if correct user
    if (req.params.user === req.user) {
        res.sendFile(path.resolve('client/character-gallery/selector.html'));
    } else {
        res.redirect('/gallery');
    }
});

// Allows gallery files to be used
app.use('/gallery/user/:user', express.static(path.join(__dirname, '/../client/character-gallery')));

// Get request for a user's character
app.get('/gallery/user/:user/character/:character', checkLoggedIn, (req, res) => {
    res.sendFile(path.resolve('client/character-sheet/character-sheet.html'));
});

// Allows character files to be used
app.use('/gallery/user/:user/character/:character', express.static(path.join(__dirname, '/../client/character-sheet')));

// TODO: Other endpoints! Fix/include them
//

// Paths that do not exist
// TODO: Make error page?
app.get('*', (req, res) => {
    res.send('You seem to be a bit lost adventurer...');
});

app.listen(port, () => {
    console.log(`App now listening at port ${port}`);
});

//--------------------Helper functions--------------------

/**
 * Checks if user exists
 * @param {string} username A username
 * @returns {boolean} Returns true if the username exists in the database
 */
function userExists(username) {
    // Checks users array if username exists
    return database.filter(user_obj => user_obj.username === username).length > 0;
}

/**
 * Validate password (Will need to encrypt later!)
 * @param {string} username A username
 * @param {string} password A hashed password (eventually!)
 * @returns {boolean} Returns true if the password is valid
 */
function validatePass(username, password) {
    const valid = true;
    // User does not exists
    if (!userExists(username)) {
        return !valid;
    }
    // Password is incorrect
    if (database.find(user_obj => user_obj.username === username).password !== password) {
        return !valid;
    }
    return valid;
}

/**
 * Adds a user to a database
 * @param {string} username A username
 * @param {string} password A hashed password
 * @param {string} email An email address
 */
function addUser(username, password, email) {
    // User should not exists in database
    if (userExists(username)) {
		return false;
    }
    // Adds user to data base and returns true
	database.push({
        username: username, 
        password: password,
        email: email,
        characters: [] 
    });
    console.log('User created: ' + username);
	return true;
}

/**
 * Checks if a user is logged in and redirects them to the
 * login page if they are not
 * @param {Object<Request>} req A request made by a client
 * @param {Object<Response>} res A response to send back to the client
 * @param {function} next The next route
 */
function checkLoggedIn(req, res, next) {
    // If we are authenticated, we run to the next route
    if (req.isAuthenticated()) {
	    next();
    // Otherwise, redirect to the login page
    } else {
	    res.redirect('/login');
    }
}