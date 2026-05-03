import React, { useContext, useEffect, useState } from "react";
import AppContext from "../context/context";
import axios from "../axios";
import CheckoutPopup from "./CheckoutPopup";

const Cart = () => {
    const { cart, removeFromCart, clearCart } = useContext(AppContext);

    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // ✅ Fetch images + validate cart
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const res = await axios.get("/api/products");

                const validIds = res.data.map((p) => p.productId);

                const updated = await Promise.all(
                    cart
                        .filter((item) => validIds.includes(item.productId))
                        .map(async (item) => {
                            try {
                                const imgRes = await axios.get(
                                    `/api/product/${item.productId}/image`,
                                    { responseType: "blob" }
                                );

                                return {
                                    ...item,
                                    imageUrl: URL.createObjectURL(imgRes.data),
                                };
                            } catch {
                                return {
                                    ...item,
                                    imageUrl: null,
                                };
                            }
                        })
                );

                setCartItems(updated);
            } catch (err) {
                console.error(err);
            }
        };

        if (cart.length) fetchCartData();
    }, [cart]);

    // ✅ Total calculation
    useEffect(() => {
        const total = cartItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        setTotalPrice(total);
    }, [cartItems]);

    // ✅ Quantity handlers
    const increaseQty = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.productId === id && item.quantity < item.stockQuantity
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQty = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.productId === id
                    ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                    : item
            )
        );
    };

    const removeItem = (id) => {
        removeFromCart(id);
        setCartItems((prev) =>
            prev.filter((item) => item.productId !== id)
        );
    };

    // ✅ Checkout
    const handleCheckout = async () => {
        try {
            for (const item of cartItems) {
                const updated = {
                    ...item,
                    stockQuantity: item.stockQuantity - item.quantity,
                };

                const formData = new FormData();
                formData.append(
                    "product",
                    new Blob([JSON.stringify(updated)], {
                        type: "application/json",
                    })
                );

                await axios.put(`/api/product/${item.productId}`, formData);
            }

            clearCart();
            setCartItems([]);
            setShowModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Empty state
    if (cartItems.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <h2 className="text-xl text-gray-600 dark:text-gray-300">
                    Your cart is empty 🛒
                </h2>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">

            <h1 className="text-2xl font-bold mb-6 dark:text-white">
                Shopping Cart
            </h1>

            <div className="space-y-4">

                {cartItems.map((item) => (
                    <div
                        key={item.productId}
                        className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow"
                    >

                        {/* LEFT */}
                        <div className="flex items-center gap-4 w-full md:w-auto">

                            {/* IMAGE */}
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover rounded"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400">No Image</span>
                                )}
                            </div>

                            {/* INFO */}
                            <div>
                                <p className="font-semibold dark:text-white">
                                    {item.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {item.brand}
                                </p>
                            </div>
                        </div>

                        {/* QUANTITY */}
                        <div className="flex items-center gap-3 mt-3 md:mt-0">

                            <button
                                onClick={() => decreaseQty(item.productId)}
                                className="px-2 py-1 border rounded hover:bg-gray-100"
                            >
                                -
                            </button>

                            <span className="font-medium">{item.quantity}</span>

                            <button
                                onClick={() => increaseQty(item.productId)}
                                className="px-2 py-1 border rounded hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>

                        {/* PRICE + REMOVE */}
                        <div className="flex items-center gap-4 mt-3 md:mt-0">

              <span className="font-semibold text-blue-600">
                ₹{item.price * item.quantity}
              </span>

                            <button
                                onClick={() => removeItem(item.productId)}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* TOTAL */}
            <div className="mt-8 flex justify-between items-center border-t pt-4">
                <h2 className="text-xl font-semibold dark:text-white">
                    Total
                </h2>
                <span className="text-2xl font-bold text-blue-600">
          ₹{totalPrice}
        </span>
            </div>

            {/* CHECKOUT */}
            <button
                onClick={() => setShowModal(true)}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Proceed to Checkout
            </button>

            {/* MODAL */}
            <CheckoutPopup
                show={showModal}
                handleClose={() => setShowModal(false)}
                cartItems={cartItems}
                totalPrice={totalPrice}
                handleCheckout={handleCheckout}
            />
        </div>
    );
};

export default Cart;