import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  // Helper to compute subtotal/total from a cart and coupon/apply flag
  computeTotals: (cart, coupon, isCouponApplied) => {
    const subtotal = (cart || []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;
    if (coupon && isCouponApplied) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }
    return { subtotal, total };
  },

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      const newCart = res.data || [];
      const { subtotal, total } = get().computeTotals(
        newCart,
        get().coupon,
        get().isCouponApplied
      );
      set({ cart: newCart, subtotal, total });
    } catch (error) {
      set({ cart: [], subtotal: 0, total: 0 });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });
      toast.success("Product added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        const { subtotal, total } = get().computeTotals(
          newCart,
          prevState.coupon,
          prevState.isCouponApplied
        );
        return { cart: newCart, subtotal, total };
      });
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  removeFromCart: async (productId) => {
    try {
      await axios.delete(`/cart`, { data: { productId } });
      set((prevState) => {
        const newCart = prevState.cart.filter((item) => item._id !== productId);
        const isCouponApplied =
          newCart.length === 0 ? false : prevState.isCouponApplied;
        const { subtotal, total } = get().computeTotals(
          newCart,
          prevState.coupon,
          isCouponApplied
        );
        return { cart: newCart, subtotal, total, isCouponApplied };
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  clearCart: async () => {
    set({
      cart: [],
      coupon: null,
      total: 0,
      subtotal: 0,
      isCouponApplied: false,
    });
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }

    try {
      await axios.put(`/cart/${productId}`, { quantity });
      set((prevState) => {
        const newCart = prevState.cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        );
        const { subtotal, total } = get().computeTotals(
          newCart,
          prevState.coupon,
          prevState.isCouponApplied
        );
        return { cart: newCart, subtotal, total };
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  getMyCoupon: async () => {
    try {
      const response = await axios.get("/coupons");
      set({ coupon: response.data });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },
  applyCoupon: async (code) => {
    try {
      const response = await axios.post("/coupons/validate", { code });
      set((prevState) => {
        const coupon = response.data;
        const isCouponApplied = true;
        const { subtotal, total } = get().computeTotals(
          prevState.cart,
          coupon,
          isCouponApplied
        );
        return { coupon, isCouponApplied, subtotal, total };
      });
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },
  removeCoupon: () => {
    set((prevState) => {
      const isCouponApplied = false;
      const { subtotal, total } = get().computeTotals(
        prevState.cart,
        prevState.coupon,
        isCouponApplied
      );
      return { isCouponApplied, subtotal, total };
    });
    toast.success("Coupon removed");
  },
}));
