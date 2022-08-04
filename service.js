const firebase = require("firebase-admin");
require("dotenv").config();

let firebaseinstance;
const databaseURL = process.env.DATABASE_URL;

exports.firebaseService = (function () {
  if (!firebaseinstance) {
    firebaseinstance = firebase.initializeApp({
      credential: firebase.credential.cert(
        require("./firebase-credential.json")
      ),
      databaseURL: databaseURL,
    });
  }
  return firebaseinstance;
})();
