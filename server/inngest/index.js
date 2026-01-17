import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Create Inngest client
export const inngest = new Inngest({ id: "movie-ticket-booking" });

/* ================================
   USER SYNC FUNCTIONS (CLERK)
================================ */

// ✅ CREATE USER
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.create(userData);
  }
);

// ✅ DELETE USER
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await User.findByIdAndDelete(event.data.id);
  }
);

// ✅ UPDATE USER
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const userData = {
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData);
  }
);

/* ================================
   RELEASE SEATS IF PAYMENT FAILS
================================ */

const releaseSeatsAndDeletedBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },

  async ({ event, step }) => {
    // ⏳ wait 10 minutes
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-10-minutes", tenMinutesLater);

    await step.run("checking-payment-status", async () => {
      const { bookingId } = event.data;

      const booking = await Booking.findById(bookingId);

      // ✅ CRITICAL FIX: booking may already be deleted
      if (!booking) return;

      // ✅ booking already paid → exit safely
      if (booking.isPaid) return;

      const show = await Show.findById(booking.show);

      if (show) {
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });

        // ✅ FIXED KEY NAME
        show.markModified("occupiedSeats");
        await show.save();
      }

      // 🗑️ delete unpaid booking
      await Booking.findByIdAndDelete(bookingId);
    });
  }
);

/* ================================
   EXPORT ALL FUNCTIONS
================================ */

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeletedBooking,
];
