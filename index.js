const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const connection = require("./config/db");
const userRouter = require("./routes/user.route");
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/users", userRouter);
const auth = require("./middelwares/auth.middleware");
const checkRole = require("./middelwares/checkrole.middleware");
const jwt = require('jsonwebtoken');

app.get("/", (req, res) => {
  res.send("Welocme to MASAI NEWS");
});

app.get("/data", auth, (req, res) => {
  console.log(req.user);
  res.send("private data");
});

app.get("/appuser", auth, (req, res) => {
  console.log(req.user);
  res.send("WELCOME TO MASAI NEWS");
});
app.get("/appadmin", auth,checkRole, (req, res) => {
    console.log(req.user);
  if ((req.user.role == "appdeveloper")) {
    res.send("MASAI application DEVELOPER");
  }else{
    res.send("you are not allowed to this portal")
  }
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(401).send("You are not authenticated");
  }

  jwt.verify(refreshToken, "coding", (err, decoded) => {
    if (err) {
      return res.status(403).send("Token is not valid");
    } else {
      let accessToken = jwt.sign(
        { email: decoded.email, username: decoded.username, role: decoded.role },
        "prettycode",
        { expiresIn: "40s" }
      );
      res.send({ accessToken });
    }
  });
});


app.listen(PORT, async () => {
  try {
    await connection;
    console.log(
      `server is running on port : ${PORT} and connected to Mongoo DB `
    );
  } catch (error) {
    console.log("error", error);
  }
});
