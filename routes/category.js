const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Category = require("../models/categoryModel");
const Product = require("../models/productsModel");
const { sanitizeInput, checkUser } = require("./utils");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/new", (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    res.render("admin/add_category");
  } else {
    res.send("401");
  }
});

router.post("/add", upload.single("image"), async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { name } = req.body;
    const nameSan = sanitizeInput(name);
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const newCategory = new Category({
        name: nameSan,
        image,
      });
      await newCategory.save();
      res.send("Category added successfully!");
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to add category.");
    }
  } else {
    res.send("401");
  }
});

router.delete("/delete/:id", async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { id } = req.params;
    try {
      Product.updateMany({ category_id: id }, { $set: { category_id: "" } });

      const result = await Category.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).send("category not found");
      }
      res.send(`Product with ID ${id} deleted successfully`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting category");
    }
  } else {
    res.send("401");
  }
});

router.get("/edit/:id", async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { id } = req.params;
    const category = await Category.findById(id);
    res.render("admin/update_category", { category });
  } else {
    res.send("401");
  }
});

router.put("/update/:id", upload.single("image"), async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { id } = req.params;
    const { name } = req.body;
    const nameSan = sanitizeInput(name);
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const updateCategory = await Category.findByIdAndUpdate(
        id,
        { name: nameSan, image },
        { new: true }
      );

      if (!updateCategory) {
        return res.status(404).send("Category not found");
      }

      res.send(`Category with ID ${id} updated successfully`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating Category");
    }
  } else {
    res.send("401");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const products = await Product.find({ category_id: id }).populate(
      "category_id",
      "name"
    );
    res.render("allproducts", { products });
  } catch (err) {
    console.log(err);
    res.render("allproducts", { products: false });
  }
});

module.exports = router;
