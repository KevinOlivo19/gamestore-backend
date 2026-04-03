const express = require("express");
const cors = require("cors");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No hay productos" });
        }

        const line_items = items.map(item => ({
            price_data: {
                currency: "mxn",
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.max(item.price * 100, 1000),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${process.env.BASE_URL}/success.html`,
            cancel_url: `${process.env.BASE_URL}/cancel.html`,
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Error al crear el pago" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});