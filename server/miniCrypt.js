import crypto from 'crypto';

/**
  @module miniCrypt
  @desc A tiny crypto lib for the 326 kids. Author: Joseph Spitzer https://github.com/sp1tz
 */

export default class miniCrypt {
  /**
    @constructor
    @arg {number} its - The number of iterations to be performed; higher iterations means more security but slower speed.
    @arg {number} keyL - The length of the result in bytes.
    @arg {number} saltL - The amount of salt in bytes.
    @arg {string} saltL - The digest (i.e. hash) algorithm to use.
    @desc Creates a new `MiniCrypt` instance.
   */
  constructor(its = 1e5, keyL = 64, saltL = 16, digest = 'sha256') {
    this.its = its;
    this.keyL = keyL;
    this.saltL = saltL;
    this.digest = digest;
  }

  /**
    @public
    @memberof MiniCrypt
    @arg {string} pw - The plain-text user password to be hashed.
    @returns {[string, string]} - An array containing (1) the salt used to hash the specified password, and (2) the hash itself.
    @desc Hash a user password.
   */
  hash(pw) {
    const salt = crypto.randomBytes(this.saltL).toString('hex'), // get our new salt for this pw
          hash = crypto.pbkdf2Sync(pw, salt, this.its, this.keyL, this.digest).toString('hex'); // hash the pw
    return [salt, hash]; // return the pair for safe storage
  }

  /**
    @public
    @memberof MiniCrypt
    @arg {string} pw - The plain-text user password to be checked.
    @arg {string} salt - The salt associated with the user.
    @arg {string} hash - The hash associated with the user.
    @returns {Boolean} - A result of `true` iff `pw` & `salt` hash to `hash`.
    @desc Validate a user password.
   */
  check(pw, salt, hash) {
    return crypto.pbkdf2Sync(pw, salt, this.its, this.keyL, this.digest).toString('hex') === hash;
  }
}