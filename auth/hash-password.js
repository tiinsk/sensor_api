var crypto = require('crypto');

const genRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0,length);   /** return required number of characters */
};

const sha512 = (password, salt) => {
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var passwordHash = hash.digest('hex');
  return {
    salt,
    passwordHash
  };
};

const saltHashPassword = (password) => {
  var salt = genRandomString(16); /** Gives us salt of length 16 */
  return sha512(password, salt);
};

module.exports = {
  genRandomString,
  sha512,
  saltHashPassword
}
