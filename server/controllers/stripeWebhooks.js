import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature error:", err.message);
    return res.status(400).send("Webhook signature failed");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) return res.json({ received: true });

      const booking = await Booking.findById(bookingId);

      if (!booking || booking.isPaid) {
        return res.json({ received: true });
      }

      booking.isPaid = true;
      booking.PaymentLink = "";
      await booking.save();

      await inngest.send({
        name: "app/show.booked",
        data: { bookingId: booking._id.toString() },
      });

      console.log("✅ Booking marked as PAID:", bookingId);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).send("Webhook processing error");
  }
};
