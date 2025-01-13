const express = require("express");
const app = express();
const productsRouter = require("./routes/products");
const categoryRouter = require("./routes/category");
const adminRouter = require("./routes/admin");
const mongoose = require("mongoose");
const Product = require("./models/productsModel");
const Category = require("./models/categoryModel");
const Order = require("./models/ordersModel");
const path = require("path");
const port = process.env.PORT || 3000;
mongoose.connect("mongodb://localhost:27017/restaurant");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");

const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.use(express.json());
app.use(
  session({
    secret: "VeryPrivateKeyOfme",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false,
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.get("/", async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ noOrders: -1 })
      .limit(5)
      .populate("category_id", "name");
    const categories = await Category.find();
    res.render("index", { products: topProducts, categories });
  } catch (err) {
    res.render("index", { products: false, categories: false });
    console.error(err);
  }
});

app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/products", productsRouter);
app.use("/category", categoryRouter);
app.use("/admin", adminRouter);
const orderRouter = require("./routes/order")(io);
app.use("/order", orderRouter);

app.get("/orderpool", (req, res) => {
  if (req.session.user) {
    res.render("./admin/orderpool.ejs");
  } else {
    res.status(401).send("401");
  }
});

io.on("connection", async (socket) => {
  console.log("A user connected");
  try {
    const orders = await Order.find({
      status: { $nin: ["Picked", "Cancelled"] },
    });
    socket.emit("allOrders", orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
  }

  socket.on("allOrders", (orderData) => {
    io.emit("allOrders", orderData);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(port, () => {
  console.log("Server running on http://localhost:3000");
});

module.exports = app;
