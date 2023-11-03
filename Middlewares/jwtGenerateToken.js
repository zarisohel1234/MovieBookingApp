const jwt = require("jsonwebtoken");

const generateToken = (payload, secret) => {
  try {
    return jwt.sign(payload, secret, {
      expiresIn: "1d",
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = generateToken;
