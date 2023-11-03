const Admin = require("../Models/Admin");
const User = require("../Models/User");
const decryptToken = require("./decryptToken");

const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || req.headers.authorization == undefined) {
      return res.sendStatus(401);
    } else {
      const decodedData = decryptToken(token, process.env.JWT_SECRET);
      if (!decodedData) {
        return res.sendStatus(401);
      }
      let validAdmin = await Admin.findById(decodedData.id);
      if (!validAdmin) {
        return res.sendStatus(403);
      }
      next();
      return decodedData;
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const verifyUserToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || req.headers.authorization == undefined) {
      return res.sendStatus(401);
    } else {
      const decodedData = decryptToken(token, process.env.JWT_SECRET_USER);
      if (!decodedData) {
        return res.sendStatus(401);
      }
      let validUser = await User.findById(decodedData.id);
      if (!validUser) {
        return res.sendStatus(403);
      }
      next();
      return decodedData;
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = { verifyAdminToken, verifyUserToken };
