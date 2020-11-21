const { emit } = require('../../../../utils');
const userModule = require('../../../../user-module');

// Fields to return to the client when a new user is created
// or when user data is requested
const publicFields = [
  'id', 'firstname', 'lastname', 'fullname',
  'email', 'username', 'signupDate'
];

module.exports = {
  emit,
  publicFields,
  appModule: userModule,
};
