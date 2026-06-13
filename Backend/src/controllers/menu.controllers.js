import mongoose from "mongoose";
import Menu from "../models/menu.model.js";

export async function createMenuItem(req, res) {
  const { name, description, price, category, isAvailable } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Name, description, price, and category are required",
      });
    }

    const normalizedPrice = Number(price);
    if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }

    const menuItem = await Menu.create({
      name,
      description,
      price: normalizedPrice,
      category,
      isAvailable,
    });

    res.status(201).json({
      message: "Menu item created successfully",
      menuItem,
      user: req.user,
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function updateMenuItem(req, res) {
  const { id } = req.params;
  const { name, description, price, category, isAvailable } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid menu item id" });
    }

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (category !== undefined) updatePayload.category = category;
    if (isAvailable !== undefined) updatePayload.isAvailable = isAvailable;
    if (price !== undefined) {
      const normalizedPrice = Number(price);
      if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
        return res.status(400).json({ message: "Price must be a valid number" });
      }
      updatePayload.price = normalizedPrice;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updatedMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({
      message: "Menu item updated successfully",
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function deleteMenuItem(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid menu item id" });
    }

    const deletedMenuItem = await Menu.findByIdAndDelete(id);
    if (!deletedMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getAllMenuItems(req, res) {
  try {
    const menuItems = await Menu.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
