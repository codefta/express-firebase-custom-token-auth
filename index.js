const express = require("express");
const path = require("path");
const fs = require("fs");
const { firebaseService } = require("./service");
const app = express();

app.use(express.json());

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: "email and password are required",
    });
  }

  // TODO: register user to persistent db. now we will save it to json
  /**
   * Find user in db
   */
  let users = JSON.parse(fs.readFileSync("users.json"));
  if (users.find((user) => user.email === email)) {
    res.status(400).json({
      error: "email already exists",
    });
  }

  /**
   * Add user to db
   */
  users.push({ email, password });
  fs.writeFileSync("users.json", JSON.stringify(users));

  /**
   * Add user to firebase
   */
  firebaseService
    .auth()
    .createUser({
      email,
      password,
    })
    .then((userRecord) => {
      console.log("Successfully created new user:", userRecord.uid);
    });

  res.json({
    message: "User registered successfully",
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: "email and password are required",
    });
  }

  let users = JSON.parse(fs.readFileSync("users.json"));
  let user = users.find((user) => user.email === email);
  if (!user) {
    res.status(400).json({
      error: "User not found",
    });
  }
  if (user.password !== password) {
    res.status(400).json({
      error: "Wrong password",
    });
  }

  let uid;

  firebaseService
    .auth()
    .getUserByEmail(email)
    .then((data) => {
      const dataParsed = data.toJSON();
      uid = dataParsed.uid;
      return uid;
    })
    .then((uid) => {
      let firebaseToken;
      firebaseService
        .auth()
        .createCustomToken(uid)
        .then((customToken) => {
          firebaseToken = customToken;
          return firebaseToken;
        })
        .then((firebaseToken) => {
          res.json({
            firebaseToken: firebaseToken,
            message: "User logged in successfully",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

app.listen(5001, () => {
  console.log("Server is running on port 3001");
});
