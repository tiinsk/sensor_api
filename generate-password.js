//can be used from command line to generate hashed password:
// node generate-password.js some-password
// => {
//   salt: 'some-random-salt',
//   passwordHash: 'some-hashed-password'
// }

const {saltHashPassword} = require('./auth/hash-password');
console.log(saltHashPassword(process.argv[2]))

