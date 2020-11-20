const db = require('../../../../databases/');
const { emit, publicFields } = require('./_utils');
const debugLog = require('../../../../utils/debug');
const { statusCodes } = require('../../../../utils/http');
const User = db.getDriver();
const errorName = 'searchUsersError';
let responseData;

module.exports = searchUsers;

/* Search for users */
async function searchUsers(req, res) {
  try {
    let { query, page = 1, limit = 20, sort } = req.query;

    if(!query || query.trim().length === 0) {
      responseData = {
        errors: [{
          location: 'query',
          msg: 'Please specify the query to search by',
          param: 'query'
        }]
      };

      emit(errorName, responseData);
      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    const users = [];
    const results = await User.searchUsers({ query, page, limit, sort});

    results.users.forEach(user => {
      const currUser = {};

      // Populate the user variable with values we want to return to the client
      publicFields.forEach(key => currUser[key] = user[key]);

      users.push(currUser);
    });

    responseData = {
      data: {
        total: results.total,
        length: results.length,
        users,
      }
    };

    emit('searchUsersSuccess', responseData);
    res.status(statusCodes.ok).json(responseData);
    return;
  } catch(err) {
    responseData = {
      errors: [{
        msg: 'There was an error processing your request. Please, try again',
      }]
    };

    emit(errorName, responseData);
    res.status(statusCodes.serverError).json(responseData);
    debugLog(`User search error: ${err}`);
    return;
  }
}