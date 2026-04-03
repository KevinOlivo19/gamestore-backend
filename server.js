const express = require("express");
const cors = require("cors");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// Endpoint para crear sesión de Stripe
app.post("/create-checkout-session", async (req, res) => {
    try {
        const { items } = req.body;

        // Validación mejorada
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "No hay productos" });
        }

        // Construcción de line_items
        const line_items = items.map(item => {
            if (!item.name || !item.price || !item.quantity) {
                throw new Error("Datos de producto inválidos");
            }

            return {
                price_data: {
                    currency: "mxn",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.max(Math.round(item.price * 100), 1000),
                },
                quantity: item.quantity,
            };
        });

        // Crear sesión de Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${process.env.BASE_URL}/success.html`,
            cancel_url: `${process.env.BASE_URL}/cancel.html`,
        });

        return res.json({ url: session.url });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ error: "Error al crear el pago" });
    }
});

// Puerto dinámico (Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});