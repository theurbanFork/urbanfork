const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/productsModel");
const Category = require("../models/categoryModel");
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

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().populate("category_id", "name");
    res.render("allproducts", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
});

router.get("/new", async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    try {
      const category = await Category.find();
      res.render("admin/add_products", { categories: category });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching products");
    }
  } else {
    res.send("401");
  }
});

router.post("/add", upload.single("image"), async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { name, description, price, category_id } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const category = await Category.findById(category_id);

    if (!category) {
      return res.status(400).send("Category not found");
    }

    try {
      const newProduct = new Product({
        name: sanitizeInput(name),
        image,
        description: sanitizeInput(description),
        price: sanitizeInput(price),
        category_id: sanitizeInput(category._id),
      });
      await newProduct.save();
      res.send("Product added successfully!");
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to add product.");
    }
  } else {
    res.send("401");
  }
});

router.delete("/delete/:id", async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { id } = req.params;
    try {
      const result = await Product.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).send("Product not found");
      }
      res.send(`Product with ID ${id} deleted successfully`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting product");
    }
  } else {
    res.send("401");
  }
});

router.get("/edit/:id", async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { id } = req.params;
    const product = await Product.findById(id);
    const category = await Category.find();
    res.render("admin/update_product", { product, categories: category });
  } else {
    res.send("401");
  }
});

router.put("/update/:id", upload.single("image"), async (req, res) => {
  if (req.session.user && checkUser(req.session.user.id)) {
    const { id } = req.params;
    const { name, description, category_id, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name: sanitizeInput(name),
          image,
          description: sanitizeInput(description),
          price: sanitizeInput(price),
          category_id: sanitizeInput(category_id),
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).send("Product not found");
      }

      res.send(`Product with ID ${id} updated successfully`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating product");
    }
  } else {
    res.send("401");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("category_id", "name");
    res.render("product", { product });
  } catch (err) {
    console.log(err);
    res.render("product", { product: false });
  }
});
module.exports = router;
