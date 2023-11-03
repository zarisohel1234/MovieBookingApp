const jwt = require("jsonwebtoken");

const decryptToken = (token, secret) => {
  try {
    let data = jwt.verify(token, secret, (err, values) => {
      if (!err) {
        return values;
      } else {
        console.log("first");
        console.log(err.message);
        return err.message;
      }
    });
    return data;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = decryptToken;
