const jwt = require("jsonwebtoken");
const User = require("../models/model");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    // console.log(verifyUser);

    const user = await User.findOne({ _id: verifyUser._id });
    console.log(user.firstname);
    req.token = token;
    req.user = user;

    // console.log(req.token);
    // console.log(req.user.tokens);

  
    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

module.exports = auth;
