import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import Navbar from "./components/Navbar";
import { useUserStore } from "./stores/useUserStore";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/LoadingSpinner";
import { useCartStore } from "./stores/useCartStore";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";

const App = () => {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems, coupon } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    //to do : reproduce error=> toast should appear, when we are automatically logged out after toke expiry and we refresh the the page(login page.).
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);
  if (checkingAuth) return <LoadingSpinner />;
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient (safe single DIV, behind content) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(16,185,129,0.45) 0%, rgba(10,80,60,0.28) 45%, rgba(0,0,0,0.06) 100%)",
          }}
        />
      </div>

      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />
            }
          />
          <Route path="/category/:category" element={<CategoryPage />} />

          <Route
            path="/cart"
            element={user ? <CartPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/purchase-success"
            element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/purchase-cancel"
            element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
