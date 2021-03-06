//--------------------Server--------------------

// Required libraries
import express from "express";
import expressSession from "express-session";
import passport from "passport";
import passportLocal from "passport-local";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { default as mongodb } from "mongodb";
import fs from "fs";
import miniCrypt from "./miniCrypt.js"; // Credits to Joseph Spitzer: https://github.com/sp1tz

const MongoClient = mongodb.MongoClient;
const mc = new miniCrypt();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: __dirname + "/.env" });
const LocalStrategy = passportLocal.Strategy;
const app = express();
const port = process.env.PORT || 8080;

// DB access configuration
let secrets, mongoURL, sessionSecret;
if (!process.env.URL) {
  secrets = JSON.parse(fs.readFileSync("./server/secrets.json"));
  mongoURL = secrets.URL;
} else {
  mongoURL = process.env.URL;
}

// For secret session in Express
if (!process.env.SECRET) {
  secrets = JSON.parse(fs.readFileSync("./server/secrets.json"));
  sessionSecret = secrets.sessionSecret;
} else {
  sessionSecret = process.env.SECRET;
}

// Session configuration
const session = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
};

const strategy = new LocalStrategy(async (username, password, done) => {
  const userOrPassCorrect = await validatePass(username, password);

  // Invalid username or password
  if (!userOrPassCorrect) {
    // Delay to prevent brute forcing pass attempts
    await new Promise((r) => setTimeout(r, 2000));
    return done(null, false, { message: "Wrong username or password" });
  }
  // success!
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

/*** Application endpoints ***/

// Get request to homepage
app.get("/", continueSession, (req, res) => {
  res.sendFile(path.resolve("client/main/homepage.html"));
});

// Allows homepage files to be used
app.use("/", express.static(path.join(__dirname, "/../client/main")));

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

// Get request to registeration verification page
app.get("/register-successful", (req, res) => {
  res.sendFile(path.resolve("client/login-register/register-successful.html"));
});

// Post request when user attempts to register
app.post("/register", async (req, res) => {
  const user = req.body["username"];
  const email = req.body["email"];
  const pass = req.body["password"];
  const userNotFound = await addUser(user, pass, email);

  // Cannot add new user
  if (!userNotFound) {
    res.redirect("/register?error=user-exists");
    // Can add new user
  } else {
    res.redirect("/register-successful");
  } 
});

// Allows register files to be used
app.use(
  "/register",
  express.static(path.join(__dirname, "/../client/login-register"))
);

// Get request that sends a user's list of characters
app.get("/user/:user/characters", checkLoggedIn, async (req, res) => {
  // Verify correct user
  if (req.params.user === req.user) {
    // Gets user from database
    const userData = await getUserData(req.user);
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
  async (req, res) => {
    const user = req.user, character = req.params.character.replace(/-/g, ' ');
    
    // Query that gets a character's image
    if (req.query.getImage) {
      const charQuery = await getChar(user, character);

      if (!charQuery) {
        res.status(404).send("Requested character does not exist.");
      } else {
        // User has not set image
        if (charQuery.charImage === undefined) {
          res.status(404).send("");
        // Image found
        } else {
          res.status(200).send(charQuery.charImage);
        }
      }

    } else if (req.query.getSheet) {
      console.log(`user ${user} requests ${character}`);

      const charQuery = await getChar(user, character);
      if (!charQuery) {
        res.status(404).send("Requested character does not exist.");
      } else {
        res.json(charQuery);
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
app.get("/character/create", checkLoggedIn, async (req, res) => {
  const username = req.user;
  const charName = req.query["char-name"];
  const charDuplicate = await charExists(username, charName);

  // Queries cannot be empty
  if (charName === undefined || username === undefined) {
    res.status(400).redirect("/gallery");
  }
  // User already exists
  else if (charDuplicate) {
    res.status(409).send("No duplicate characters allowed for a user");
    // User can be created
  } else {
    // Updates user's collection and inserts new character in character collection
    await createNewChar(username, charName);
    console.log("New character: " + charName + ", from user: " + username);
    res.status(200).send(charName + " has been succesfully created");
  }
});

// Delete request for a user's character
app.delete("/character/delete", checkLoggedIn, async (req, res) => {
  const charName = req.body.character;
  const username = req.user;
  const charDuplicate = await charExists(username, charName);

  if (charDuplicate) {
    deleteChar(username, charName);
    console.log("Character deleted " + charName);
    res.status(200).send(charName + " deleted");
  } else {
    res.status(400).send(charName + " cannot be deleted at this time");
  }
});

// Save char sheet
app.post(
  "/char-sheet-save/user/:user/character/:character",
  checkLoggedIn,
  async (req, res) => {
    const user = req.user,
      char = req.params.character.replace(/-/g, ' '),
      data = req.body;

    console.log(`$user ${user} attempts to save ${char}`);

    const result = await saveChar(data);

    if (result) {
      res.status(200);
    } else {
      res.status(500);
    }
  }
);

// Export char sheet
app.get(
  "/char-sheet-export/user/:user/character/:character",
  checkLoggedIn,
  async (req, res) => {
    const user = req.user,
      char = req.params.character.replace(/-/g, ' '),
      testfile = await getChar(user, char);
    
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

// Error page
app.get("/404", (req, res) => {
  res.sendFile(path.resolve("client/404page/404page.html"));
});

// Error page files
app.use("/404", express.static(path.join(__dirname, "/../client/404page")));

// Redirects to error page
app.get("*", (req, res) => {
  res.status(404).redirect("/404");
});

app.listen(port, () => {
  console.log(`App now listening at port ${port}`);
});

//--------------------Helper functions--------------------

// ESLint ignores unused params in functions
/* eslint-disable no-unused-vars */

/**
 * Validate password (Will need to encrypt later!)
 * @param {string} username A username
 * @param {string} password An unhashed password
 * @returns {boolean} Returns true if the password is valid
 */
async function validatePass(username, password) {
  const valid = true;
  // Connects to server and attempts to validate password
  return mongoConnect(async (users, chars) => {
    // check if user does not exists
    if ((await users.findOne({ user: username })) === null) {
      return !valid;
    }
    const userData = await users.findOne({ user: username });
    // Password is incorrect
    if (!mc.check(password, userData.pass[0], userData.pass[1])) {
      return !valid;
    }
    // Password valid
    return valid;
  });
}

/**
 * Adds a user to a database
 * @param {string} username A username
 * @param {string} password An unhashed password
 * @param {string} email An email address
 * @returns {boolean} True if a user can be added
 */
async function addUser(username, password, email) {
  const [salt, hash] = mc.hash(password);
  // User or email should not exist in the database
  const result = mongoConnect(async (users, chars) => {
    // check if user exists and returns false if they do
    if ((await users.findOne({ user: username })) !== null) {
      return false;
      // Checks if email exists and returns false if they do
    } else if ((await users.findOne({ email: email })) !== null) {
      return false;
    } else {
      // add user to db if username/password don't exist
      await users.insertOne({
        user: username,
        pass: [salt, hash],
        email: email,
        characters: [],
      });
      console.log("New user created: " + username);
      return true;
    }
  });
  return result;
}

/**
 * Gets user data.
 * assumes user exists.
 * @param {string} username The name of the user.
 * @returns {Object<User>} the user's data.
 */
async function getUserData(username) {
  return mongoConnect(async (users, chars) => {
    const userData = await users.findOne({ user: username });
    return userData;
  });
}

/* eslint-enable no-unused-vars */

/**
 * Checks if a user's character exists in the database
 * assumes that user exists
 * @param {string} username A username
 * @param {string} newCharacter The name of the new character
 * @returns {boolean} Returns true if the character exists
 */
async function charExists(username, newCharacter) {
  const userData = await getUserData(username);  
  // Accounts for character names with spaces and coverts them to dashes and lowercase
  return (
    userData.characters
            .filter(char => char
            .replace(/-/g, ' ') === newCharacter).length > 0
  );
}

/**
 * Creates a new character into a user's array of characters
 * and the character collection. Assumes user exists.
 * @param {string} username A username to append the new character into
 * @param {string} charName The new character name
 */
async function createNewChar(username, charName) {
  mongoConnect(async (users, chars) => {
    // Update a user's character array
    await users.updateOne(
      { user: username },
      { $push: { characters: charName } }
    );
    // Inserts username and character name into chracter collection
    await chars.insertOne({ user: username, charName: charName });
  });
}

/**
 * Deletes a character in the user and character collection. A user's
 * character in their list of characters will be deleted alongside
 * with the character found in the character collection
 * @param {string} username A username in which a character will be deleted from
 * @param {string} charName The character name to delete
 */
async function deleteChar(username, charName) {
  mongoConnect(async (users, chars) => {
    // Update a user's character array
    await users.updateOne(
      { user: username },
      { $pull: { characters: charName } }
    );
    // Deletes username character name from character collection
    await chars.deleteOne({ user: username, charName: charName });
  });
}

/**
 * Gets a character for a given user
 * assumes both user and character exist
 * @param {string} username the name of the user
 * @param {string} character the name of the character
 * @returns {Object} the character data
 */
async function getChar(username, character) {
  const result = mongoConnect(async (users, chars) => {
    const charSearch = await chars.findOne({
      $and: [{ user: username }, { charName: character }],
    });

    if (charSearch !== null) {
      delete charSearch._id;
      return await charSearch;
    } else {
      return false;
    }
  });

  return result;
}

/**
 * Updates a character's attributes in the character
 * collection portion of the database.
 * @param {Object<Character>} charData an object that represents a Character
 * @returns {boolean} Returns true if a character can be saved
 */
async function saveChar(charData) {
  const result = mongoConnect(async (users, chars) => {
    const charSearch = await chars.findOne({
      $and: [{ user: charData.user }, { charName: charData.charName }],
    });
    if (charSearch !== null) {
      const ack = await chars.replaceOne(
        { $and: [{ user: charData.user }, { charName: charData.charName }] },
        charData
      );
      return ack.result.nModified === 1; // confirmation one was modified
    } else {
      return false;
    }
  });
  return result;
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

/**
 * Continues a user's session if they are logged in. They
 * will be redirected to the gallery if they are logged in
 * or redirecteed to the homepage if they are not.
 * @param {Object<Request>} req A request made by a client
 * @param {Object<Response>} res A response to send back to the client
 * @param {function} next The next route
 */
function continueSession(req, res, next) {
  // We got redirected to the gallery if autenticated (skip homepages)
  if (req.isAuthenticated()) {
    res.redirect("/gallery");
    // If we are not authenticated, we run to the next route
  } else {
    next();
  }
}

/**
 * Connects to the database and runs the given function using the db collections.
 * @param {function} func An async function which takes users and chars (collections) as parameters.
 * @return {boolean} The result of the operation (as returned by the passed in function).
 *  returns false if there was a connection error.
 */
async function mongoConnect(func) {
  let result = true;
  const client = new MongoClient(mongoURL);
  try {
    // connect to the client
    await client.connect();
    const db = client.db("euryale"),
      users = db.collection("users"),
      chars = db.collection("characters");
    // run given async function and store result
    result = await func(users, chars);
  } catch (e) {
    console.log(e.stack);
    result = false;
  } finally {
    await client.close();
  }
  return result;
}