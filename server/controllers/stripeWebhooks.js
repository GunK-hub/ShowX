import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // ✅ CORRECT EVENT FOR STRIPE CHECKOUT
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        return response.json({ received: true });
      }

      // ✅ Fetch booking safely
      const booking = await Booking.findById(bookingId);

      // Booking already handled or deleted
      if (!booking || booking.isPaid) {
        return response.json({ received: true });
      }

      // ✅ Mark booking as paid
      booking.isPaid = true;
      booking.PaymentLink = "";
      await booking.save();

      // ✅ Send Inngest event ONCE
      await inngest.send({
        name: "app/show.booked",
        data: {
          bookingId: booking._id.toString(),
        },
      });
    }

    response.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    response.status(500).send("Internal server error");
  }
};
