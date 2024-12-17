const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");
const Product = require("../models/productsModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { checkUser } = require("./utils");

router.get("/", async (req, res) => {
  if (req.session.user && req.session.user && checkUser(req.session.user.id)) {
    const products = await Product.find().populate("category_id", "name");
    const categories = await Category.find();
    const users = await User.find();
    res.render("admin/admin", { products, categories, users });
  } else {
    res.send("401");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user = { id: user._id };
      res.redirect("/admin/");
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
});

router.get("/register", (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    res.render("register");
  } else {
    res.send("401");
  }
});
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("./login");
  });
});
router.delete("/deleteuser/:id", async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { id } = req.params;
    try {
      const result = await User.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).send("user not found");
      }
      res.send(`User with ID ${id} deleted successfully`);
    } catch (err) {
      console.log(err);
      res.send("error");
    }
  } else {
    res.send("401");
  }
});
router.post("/createuser", async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      res.status(201).send("User created successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating user");
    }
  } else {
    res.send("401");
  }
});
module.exports = router;
