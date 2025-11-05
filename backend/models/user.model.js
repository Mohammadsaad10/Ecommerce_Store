import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1, //default is 1 , because if product is listed, then atleast 1 quantity is there
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //if password is not modified, then no need to hash again

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();

  //salt : random string generate once and added to password before hashing.
  //cost factor is 10 : means salt is added 2^10 times to the password before hashing. i.e. 1024 times
});

// Method to compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema); //User collection will be created in the database

export default User;
