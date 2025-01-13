const User = require("./models/userModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const DATABASE_URL = "mongodb://127.0.0.1:27017/restaurant";

mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
async function addUser(username, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    console.log("User Created !");
  } catch (error) {
    console.error(error);
  }
}

username = "firstUser";
password = "T1234567@";

addUser(username, password);
