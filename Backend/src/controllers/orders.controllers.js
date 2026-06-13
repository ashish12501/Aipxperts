import mongoose from "mongoose";
import Order from "../models/order.model.js";

export async function createOrder(req, res) {
  const { customerName, items } = req.body;

  try {
    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "customerName and at least one order item are required",
      });
    }

    const normalizedItems = [];

    for (const item of items) {
      const { menuItemId, name, quantity, price } = item;

      if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
        return res.status(400).json({ message: "Invalid menuItemId in items" });
      }

      if (!name) {
        return res.status(400).json({ message: "Item name is required" });
      }

      const normalizedQuantity = Number(quantity);
      const normalizedPrice = Number(price);

      if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
        return res
          .status(400)
          .json({ message: "Item quantity must be an integer >= 1" });
      }

      if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
        return res.status(400).json({ message: "Item price must be >= 0" });
      }

      normalizedItems.push({
        menuItemId,
        name,
        quantity: normalizedQuantity,
        price: normalizedPrice,
      });
    }

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const order = await Order.create({
      customerName,
      items: normalizedItems,
      totalAmount,
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Valid status is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: status.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
