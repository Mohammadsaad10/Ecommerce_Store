import Product from "../models/products.model.js";
import {redis} from "../lib/redis.js";
import { json } from "express";

export const getAllProducts = async (req, res) => {
  try {
    const prouduct = await Product.find();

    res.status(200).json({ prouduct });
  } catch (error) {
    console.log("Error in getAllProducts controller!");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts)); //redis stores products in String format.
    }

    //if not in redis, fetch from mongoDB
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    //lean() function : It is used to improve performance by returning plain JavaScript objects instead of Mongoose documents.

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller!");
    return res.status(500).json({ message: "Interval Server Error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, discription, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    //cloudinaryResponse will return an object containing details about the uploaded image, including its URL.

    const product = Product.create({
      name,
      discription,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in create product controller!");
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Deleted image from cloudinary.");
      } catch (error) {
        console.log("Error deleting image from cloudinary.");
      }
    }

    //publicId is the unique identifier for each image stored in Cloudinary.
    // product.image is String , so we split it to get the array of substrings, which contains the publicId.
    //then we use pop() to get the last element of array (for ex. 'image.jpg').
    //again split by '.' to and then take the first part as publicId (for ex. 'image').

    //images are stored in redis in format => 'folder/publicId'.

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller!");
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getRecommededProducts = async (req, res) => {
  try {
    // .aggregate() lets you run MongoDB aggregation operations, which process data records and return computed results.
    const products = await Product.aggregate([
      {
        $sample: { size: 3 }, //randomly select sample of 3 from Product collection.
      },
      {
        $project: {
          //specifies which fields to include in the output.
          _id: 1, //1 means include.
          name: 1,
          discription: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in recommendedProducts controller!");
    res
      .status(500)
      .json({ message: "Internal Server Error.", error: error.message });
  }
};
//working of getRecommededProducts controller:
//1. $sample stage randomly selects 3 products from the Product collection.
//2. $project stage specifies which fields to include in the output (only _id, name, discription, image, and price).
//3. The resulting array of products is sent back as a JSON response.

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    console.log("Error in getProductsByCategory controller!");
    res
      .status(500)
      .json({ message: "Internal Server Error!", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller!");
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateFeaturedProductsCache = async () => {
  try {
    //lean() function : It is used to improve performance by returning plain JavaScript objects instead of Mongoose documents.
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in updateFeaturedProductsCache function!");
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
