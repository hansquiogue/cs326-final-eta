//--------------------Server--------------------

// Required libraries
import express from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: __dirname + "/.env" });
const LocalStrategy = passportLocal.Strategy;
const app = express();
const port = process.env.PORT || 8080;

// Session configuration
const session = {
  secret: process.env.SECRET || "SECRET-CHANGE-TODO",
  resave: false,
  saveUninitialized: false,
};

const strategy = new LocalStrategy(async (username, password, done) => {
  // No user exists
  if (!userExists(username)) {
    return done(null, false, { message: "Wrong username" });
  }
  // Invalid password
  if (!validatePass(username, password)) {
    // Delay to prevent brute forcing pass attempts
    await new Promise((r) => setTimeout(r, 2000));
    return done(null, false, { message: "Wrong password" });
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
app.use(express.urlencoded({ extended: true }));

//--- Temporary user storage (TODO: Replace/remove with MongoDB)
// Type: user = { user, *encrypted* pass, email, characters[] }
const database = [];
//--------------------------------------------

/*** Application endpoints ***/

// Get request to homepage
app.get("/", (req, res) => {
  res.sendFile(path.resolve("client/homepage/homepage.html"));
});

// Allows homepage files to be used
app.use("/", express.static(path.join(__dirname, "/../client/homepage")));

// Get request to login page
app.get("/login", (req, res) => {
  res.sendFile(path.resolve("client/login-register/signin.html"));
});

// Post request when user attempts to login
app.post(
  "/login",
  // Uses username/password authentication
  passport.authenticate("local", {
    failureRedirect: "/login?attempt=failure",
  }),
  // Successful and redirects to gallery
  (req, res) => {
    const user = req.body["username"];
    res.redirect("/gallery/user/" + user);
  }
);

// Allows login files to be used
app.use(
  "/login",
  express.static(path.join(__dirname, "/../client/login-register"))
);

// Get request to registration page
app.get("/register", (req, res) => {
  res.sendFile(path.resolve("client/login-register/register.html"));
});

// Post request when user attempts to register
app.post("/register", (req, res) => {
  const user = req.body["username"];
  const email = req.body["email"];
  const pass = req.body["password"];

  // TODO: (Helper function) Regex to see if fields are valid?

  // Cannot add new user
  if (!addUser(user, pass, email)) {
    res.redirect("/register?error=user-exists");
    // Can add new user
  } else {
    // TODO: Succesful registration page instead of redirecting to login page
    res.redirect("/login");
  }
});

// Allows register files to be used
app.use(
  "/register",
  express.static(path.join(__dirname, "/../client/login-register"))
);

// Get request that sends a user's list of characters
app.get('/user/:user/characters', checkLoggedIn, (req, res) => {
    // Verify correct user
    if (req.params.user === req.user) {
        // Gets user from database
        const userData = getUserData(req.user);
        // Sends user's characters
        res.status(200).send(JSON.stringify(userData.characters));
    // Redirects to user's characters
    } else {
        res.redirect("/user/" + req.user + "/characters");
    }
});

// Get request and redirects user to their own page
app.get("/gallery", checkLoggedIn, (req, res) => {
  res.redirect("/gallery/user/" + req.user);
});

// Get request for a user's gallery page
app.get("/gallery/user/:user/", checkLoggedIn, (req, res) => {
  // Verify if correct user
  if (req.params.user === req.user) {
    res.sendFile(path.resolve("client/character-gallery/selector.html"));
  } else {
    res.redirect("/gallery");
  }
});

// Allows gallery files to be used
app.use(
  "/gallery/user/:user",
  express.static(path.join(__dirname, "/../client/character-gallery"))
);

// Get request for a user's character sheet
app.get(
  "/gallery/user/:user/character/:character",
  checkLoggedIn,
  (req, res) => {
    if (req.query.getSheet) {
      const user = req.user,
        character = req.params.character;
      // console.log(`user ${user} requests ${character}`);

      if (charExists(user, character)) {
        res.json(getCharacter(user, character));
      } else {
        res.status(404).send("Requested character does not exist.");
      }
    } else {
      res.sendFile(path.resolve("client/character-sheet/character-sheet.html"));
    }
  }
);

// Allows character sheet files to be used
app.use(
  "/gallery/user/:user/character/:character",
  express.static(path.join(__dirname, "/../client/character-sheet"))
);

// Get request for creating a new chracter
app.get("/character/create", checkLoggedIn, (req, res) => {
  const username = req.user;
  const charName = req.query["char-name"];

  // Queries cannot be empty
  if (charName === undefined || username === undefined) {
    res.status(400).redirect("/gallery");
  }
  // User already exists
  else if (charExists(username, charName)) {
    // TODO: Error stating character exists
    res.status(409).send("No duplicate characters allowed for a user");
    // User can be created
  } else {
    // Gets user in database   
    const userData = getUserData(username);
    // Pushes new character in user
    userData.characters.push(charName);
    console.log('New character: ' + charName + ', from user: ' + username);
    res.status(200).send(charName + " has been succesfully created");
  }
});

// Delete request for a user's character
app.delete("/character/delete", checkLoggedIn, (req, res) => {
    const userData = getUserData(req.user);
    const char = req.body.character;

    if (charExists(req.user, char)) {
        const charIndex = userData.characters.indexOf(char);
        // Character deleted in database
        userData.characters.splice(charIndex, 1);
        res.status(200).send(char + ' deleted');
    } else {
        res.status(400).send(char + ' cannot be deleted at this time');
    }
});

// TODO: Other endpoints! Fix/include them
// Save char sheet
app.post(
  "char-sheet-save/user/:user/character/:character",
  checkLoggedIn,
  (req, res) => {
    const user = req.user,
      char = req.params.character,
      data = req.body;
    res.status(200).json(data);
  }
);

// Export char sheet
app.get(
  "char-sheet-export/user/:user/character/:character",
  checkLoggedIn,
  (req, res) => {
    const user = req.user,
      char = req.params.character,
      testfile = { user: user, char: char };

    res.json(testfile);
  }
);

// Logout
app.get("/logout", checkLoggedIn, (req, res) => {
  req.session.destroy(() => {
    req.logout();
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Paths that do not exist
// TODO: Make error page?
app.get("*", (req, res) => {
  res.send("You seem to be a bit lost adventurer...");
});

app.listen(port, () => {
  console.log(`App now listening at port ${port}`);
});

//--------------------Helper functions--------------------

/**
 * Checks if user exists in datavase
 * @param {string} username A username
 * @returns {boolean} Returns true if the username exists in the database
 */
function userExists(username) {
  // Checks database array if username exists
  return (
    database.filter((user_obj) => user_obj.username === username).length > 0
  );
}

/**
 * Checks if email exists in database
 * @param {string} email An email
 * @returns {boolean} Returns true if the email exists in the database
 */
function emailExists(email) {
  // Checks database array if email exists
  return database.filter((user_obj) => user_obj.email === email).length > 0;
}

/**
 * Checks if a user's character exists in the database
 * assumes that user exists
 * @param {string} username A username
 * @param {string} newCharacter The name of the new character
 * @returns {boolean} Returns true if the character exists
 */
function charExists(username, newCharacter) {
  // Database is empty
  if (database.length === 0) {
    return false;
  }
  const userData = getUserData(username);
  // Accounts for character names with spaces and coverts them to dashes
  return userData.characters.filter(char => char === newCharacter.replace('-', ' ')).length > 0;
}

/**
 * Gets user data.
 * assumes user exists.
 * @param {string} username The name of the user.
 * @returns {Object} the user's data.
 */
function getUserData(username) {
  const userIndex = database.findIndex(
    (user_obj) => user_obj.username === username
  );
  return database[userIndex];
}
/**
 * Gets a character for a given user
 * assumes both user and character exist
 * @param {string} username the name of the user
 * @param {string} character the name of the character
 * @returns {Object} the character data
 */
function getCharacter(username, character) {
  const userData = getUserData(username);
  // console.log(userData);
  const char = userData.characters.filter((c) => c.charName === character);
  // console.log(JSON.stringify(char));
  // console.log(JSON.stringify(char[0]));
  return char[0];
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
  if (
    database.find((user_obj) => user_obj.username === username).password !==
    password
  ) {
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
  // User or email should not exist in the database
  if (userExists(username) || emailExists(email)) {
    return false;
  }
  // Adds user to data base and returns true
  database.push({
    username: username,
    password: password,
    email: email,
    // characters: [{ charName: "nutmeg" }],
    characters: ["Nutmeg", "Noob"],
  });
  console.log("New user created: " + username);
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
    res.redirect("/login");
  }
}
