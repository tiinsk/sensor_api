module.exports = {
  method: 'GET',
  path: '/',
  options: {
    auth: false
  },
  handler: (request, h) => {
    return 'Hello world!';
  }
};
