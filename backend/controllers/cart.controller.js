import Product from "../models/products.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    //add quantity for each item in products. (Product model does not have quantity field).
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });
    //toJSON() : converts mongoose document to plain JS object.

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller!");
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller!");
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = req.user;

    if (!productId) {
      user.cartItems = []; // Clear all items if no productId is provided
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    //filter fn : creates a new array with all elements that pass the test implemented by the provided function.

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller!");
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);

        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      return res.json(user.cartItems);
    } else {
      res.status(400).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller!");
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
