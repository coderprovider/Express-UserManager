const db = require('../../../../databases/');
const emailValidator = require('email-validator');
const { emit, publicFields } = require('./_utils');
const debugLog = require('../../../../utils/debug');
const { statusCodes } = require('../../../../utils/http');
const { checkPassword, generateAuthToken } = require('../../../../utils/auth');
const User = db.getDriver();
const errorName = 'loginError';
let responseData;

module.exports = login;

async function login(req, res) {
  try {
    const { login, password } = req.body;
    const isEmail = emailValidator.validate(login);
    const userData = isEmail
      ? await User.findByEmail(login)
      : await User.findByUsername(login);

    if(!userData) {
      responseData = {
        errors: [{
          msg: 'User not found!',
        }]
      };

      emit(errorName, responseData);
      res.status(statusCodes.notFound).json(responseData);
      return;
    }

    if(!(await checkPassword(password, userData.password))) {
      responseData = {
        errors: [{
          msg: 'The username or password you have provided is invalid',
          param: 'password'
        }]
      };

      emit(errorName, responseData);
      res.status(statusCodes.notFound).json(responseData);
      return;
    }

    const user = {};

    // Populate the user variable with values we want to return to the client
    publicFields.forEach(key => user[key] = userData[key]);

    req.session.user = user; // Maintain the user's data in current session

    // Create an auth token for the user so we can validate future requests
    const { token, expiry } = generateAuthToken(user.id, user.email);
    const authorization = { token: `Bearer ${token}`, expiresIn: expiry };

    responseData = {
      data: { user,  authorization }
    };

    emit('loginSuccess', responseData);
    res.status(statusCodes.ok).json(responseData);
    return;
  } catch(err) {
    responseData = {
      errors: [{ msg: 'There was an error logging in the user' }]
    };

    emit(errorName, responseData);
    res.status(statusCodes.serverError).json(responseData);

    debugLog(`Error authenticating user: ${err}`);
    return;
  }
}