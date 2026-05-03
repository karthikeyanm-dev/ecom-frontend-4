import "./App.css";
import React, { useState } from "react";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import Footer from "./components/Footer";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/context";
import UpdateProduct from "./components/UpdateProduct.jsx";

function App() {
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    //  Category filter
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    //  Cart logic
    const addToCart = (product) => {
        const existingProduct = cart.find(
            (item) => item.id === product.id
        );

        if (existingProduct) {
            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    return (
        <AppProvider>
            <BrowserRouter>

                {/* Navbar */}
                <Navbar onSelectCategory={handleCategorySelect} />

                {/* Main Content */}
                <main className="pt-30 min-h-screen">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Home
                                    addToCart={addToCart}
                                    selectedCategory={selectedCategory}
                                />
                            }
                        />

                        <Route path="/add-product" element={<AddProduct />} />

                        <Route path="/product/:id" element={<Product />} />

                        <Route path="/cart" element={<Cart cart={cart} />} />
                        <Route path="/product/update/:id" element={<UpdateProduct />} />
                    </Routes>
                </main>

                {/* Footer */}
                <Footer />

            </BrowserRouter>
        </AppProvider>
    );
}

export default App;