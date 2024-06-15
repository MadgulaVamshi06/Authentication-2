const express = require("express");
const UserModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const blacklisted = require("../blacklist")

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
       const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ "message": "User already registered" });
        }
    bcrypt.hash(password, 2, async (err, hash) => {
      if (err) {
        res.status(404) .send({"message": "Registration Failed,something went wrong while hashing "});
      } else {
        const user = new UserModel({ username, email, password: hash, role });
        await user.save();
        return res.status(200).send({ "message": "New user has registered" });
      }
    });
  } catch (error) {
    return res.status(400).send({ "message": "Registration failed" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const olduser = await UserModel.findOne({ email });
    if (!olduser) {
      return res.status(404).send('User not found  && Please Register ');
    }
    const user = await UserModel.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (err) {
          return res.status(400).send({"message": "Something went wrong while comparaing password",}); }
        console.log(result)
        if (result) {
          let acessToken = jwt.sign({ email: user.email, username: user.username, role: user.role }, "prettycode",{expiresIn : "40s"});
          let refreshToken = jwt.sign({ email: user.email, username: user.username, role: user.role }, "coding",{expiresIn : "1d"});
          res.status(200).send({ "message": "Login succesfull", "acessToken": acessToken , "refreshToken":refreshToken});
        } else {
          res.status(404).send({ "message": "Wrong Password" });
        }
      });
    } else {
      return res.status(400).send({ message: "Worng Credentails or you need to register first" });
    }
  } catch (error) {
    return res.status(400).send({ "message": "error" });
  }
});


userRouter.get("/logout",(req,res)=>{
    let token = req.headers.authorization.split(" ")[1];
    blacklisted.push(token)
    res.status(200).send({"message":"logout successfully"})
})

module.exports = userRouter;
