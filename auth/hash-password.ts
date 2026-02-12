import crypto from 'crypto';

export const genRandomString = length => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

export const sha512 = (password, salt) => {
  const hash = crypto.createHmac(
    'sha512',
    salt
  ); /** Hashing algorithm sha512 */
  hash.update(password);
  const passwordHash = hash.digest('hex');
  return {
    salt,
    passwordHash,
  };
};

export const saltHashPassword = password => {
  const salt = genRandomString(16); /** Gives us salt of length 16 */
  return sha512(password, salt);
};
