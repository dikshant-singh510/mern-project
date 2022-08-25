require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.port || 3000;
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

// REQUIRING DATABASE FILE TO CONNECT DATABASE
require("./db/connection");
const User = require("./models/model");

// definding path of public folder
const staticPath = path.join(__dirname, "../public");
const templatesPath = path.join(__dirname, "../templates/views");

// using css,assets... from public folder
app.use(express.static(staticPath));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
//  setting view engineas hbs
app.set("view engine", "hbs");
app.set("views", templatesPath);

// console.log(process.env.SECRET_KEY);

app.get("/user", auth, (req, res) => {
  // rendering hbs file named "index.hbs"
  // console.log(`this is the cookie ${req.cookies.jwt}`);

  res.render("user", {
    cookieName: req.cookies.jwt,
  });
});

app.get("/logout", auth, async (req, res) => {
  try {
    // logout from current device

    req.user.tokens = req.user.tokens.filter((currentElement)=>{
      return currentElement.token !== req.token
    })

    // logout for all devices
    // req.user.tokens = [];
    //  console.log(req.user.tokens);
    res.clearCookie("jwt");
    console.log("successfully logout");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/", (req, res) => {
  // rendering hbs file named "index.hbs"
  res.render("index");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password === confirmPassword) {
      const registerUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        age: req.body.age,
        gender: req.body.gender,
        password,
        confirmPassword,
      });
      // console.log(`success part ${registerUser}`);

      const token = await registerUser.generateAuthToken();
      // console.log(`success part ${token}`);

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });
      // console.log(cookie);

      const saveData = await registerUser.save();
      res.status(201).render("index");
    } else {
      res.send("password is not matching");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(`email -->${email} and password -->${password}`);

    const useremail = await User.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);
    // Muddleware
    const token = await useremail.generateAuthToken();
    // console.log(`success part ${token}`);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    });

    // console.log(`this is the cookie ${req.cookies.jwt}`);

    if (isMatch) {
      res.status(201).render("user");
    } else {
      res.send("Invalid login details!!!");
    }
  } catch (error) {
    res.status(400).send("invalid information");
  }
});

// const securePassword = async (password) => {
//   const passwordHash = await bcrypt.hash(password, 10);
//   console.log(passwordHash);

//   const secureMatch = await bcrypt.compare(password, passwordHash);
//   console.log(secureMatch);
// };

// securePassword("ganesh");

// const jwt = require("jsonwebtoken");

// const createToken = async () => {
//   const token = await jwt.sign({foo:"bars"},"abcdefghijklmnopqrstuvwxyz",{expiresIn:"2 seconds"});
//   console.log(token
//     );

//     const userVerify = await jwt.verify(token, "abcdefghijklmnopqrstuvwxyz");
//     console.log(userVerify);
// }

// createToken();

app.listen(port, () => {
  console.log(`server is ready at http://localhost:${port}`);
});
