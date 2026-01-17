import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

// =======================================================
// CREATE INNGEST CLIENT
// =======================================================

export const inngest = new Inngest({
  id: "movie-ticket-booking",
});

// =======================================================
// CLERK → USER SYNC FUNCTIONS
// =======================================================

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

    await User.create({
      _id: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    });
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

    await User.findByIdAndUpdate(id, {
      email: email_addresses?.[0]?.email_address,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url,
    });
  }
);

// =======================================================
// RELEASE SEATS IF PAYMENT NOT COMPLETED (AFTER 10 MIN)
// =======================================================

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

      // ❗ booking may already be deleted
      if (!booking) return;

      // ✅ payment completed → do nothing
      if (booking.isPaid) return;

      const show = await Show.findById(booking.show);

      if (show) {
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });

        // ✅ correct key
        show.markModified("occupiedSeats");
        await show.save();
      }

      // 🗑️ delete unpaid booking
      await Booking.findByIdAndDelete(bookingId);
    });
  }
);

// =======================================================
// SEND BOOKING CONFIRMATION EMAIL (ONLY IF PAID)
// =======================================================

const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },

  async ({ event }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    // ❗ SAFETY GUARDS (CRITICAL)
    if (!booking || !booking.user || !booking.show) return;
    if (!booking.isPaid) return;

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `
      <div style="font-family: Arial, sans-serif; background:#0f0f0f; color:#ffffff; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#1c1c1c; padding:24px; border-radius:10px;">

          <h2 style="color:#a855f7;">
            Hi ${booking.user.name || "there"},
          </h2>

          <p>
            Your booking for
            <strong style="color:#f84565;">
              ${booking.show.movie.title}
            </strong>
            is confirmed ✅
          </p>

          <p>
            <strong>Date:</strong>
            ${new Date(booking.show.showDateTime).toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
            <br/>

            <strong>Time:</strong>
            ${new Date(booking.show.showDateTime).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <p>
            <strong>Seats:</strong>
            ${booking.bookedSeats.join(", ")}
          </p>

          <p>
            <strong>Amount Paid:</strong>
            ₹${booking.amount}
          </p>

          <hr style="border:0; border-top:1px solid #333; margin:16px 0;" />

          <p>🎬 Enjoy the show!</p>

          <p style="font-size:13px; color:#9ca3af;">
            Thanks for booking with us,<br/>
            <strong>ShowX</strong>
          </p>

        </div>
      </div>
      `,
    });
  }
);

// =======================================================
// EXPORT ALL FUNCTIONS
// =======================================================

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeletedBooking,
  sendBookingConfirmationEmail,
];
