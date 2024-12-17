const express = require("express");
const router = express.Router();
const Order = require("../models/ordersModel");
const { sanitizeInput, checkUser } = require("./utils");
const Product = require("../models/productsModel");
module.exports = (io) => {
  router.get("/", (req, res) => {
    res.render("order");
  });

  const all_orders = async () => {
    const current_orders = await Order.find({
      status: { $nin: ["Picked", "Cancelled"] },
    });
    io.emit("allOrders", current_orders);
  };

  router.post("/checkout", async (req, res) => {
    const { customer, cart } = req.body;
    if (cart.length > 0) {
      try {
        const newOrder = new Order({
          customer: {
            name: sanitizeInput(customer.name),
            email: sanitizeInput(customer.email),
            contact_no: sanitizeInput(customer.contact_no),
          },
          products: cart,
          status: "Pending",
        });
        cart.forEach(async (item) => {
          const product = await Product.findById(item.id);

          await Product.findByIdAndUpdate(item.id, {
            noOrders: product.noOrders + 1,
          });
        });

        await newOrder.save();
        all_orders();
        res.status(201).send(newOrder);
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Order creation failed" });
      }
    } else {
      res.status(500).send({ error: "Order creation failed" });
    }
  });

  router.put("/update/:id", async (req, res) => {
    if (req.session.user && checkUser(req.session.user.id)) {
      const { id } = req.params;
      const body = req.body;
      try {
        const updatedOrder = await Order.findByIdAndUpdate(
          id,
          { status: body.status },
          { new: true }
        );
        if (!updatedOrder) {
          return res.status(404).send("Order not found");
        }
        all_orders();
        res.send(`Order ${id} updated successfully`);
      } catch (err) {
        console.log(err);
        res.status(500).send("Error updating order");
      }
    } else {
      res.send("401");
    }
  });

  return router;
};
