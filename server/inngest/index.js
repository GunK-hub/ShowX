import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  {id: 'sync-user-from-clerk'},
  {event: 'clerk/user.created'},
  async ({event}) => {
    const {id, first_name, last_name, email_adresses, image_url} = event.data
    const userData = {
      _id: id,
      email: email_adresses[0].email_adresses,
      name: first_name + ' ' + last_name,
      image: image_url
    }
    await User.create(userData)
  }
)

//inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
  {id: 'delete-user-with-clerk'},
  {event: 'clerk/user.deleted'},
  async ({event}) => {
    
    const {id} = event.data
    await User.findByIdAndDelete(id)    
  }
)

//inngest function to update user data from database
const syncUserUpdation = inngest.createFunction(
  {id: 'update-user-from-clerk'},
  {event: 'clerk/user.updated'},
  async ({event}) => {
       const {id, first_name, last_name, email_adresses, image_url} = event.data
       const userData = {
      _id: id,
      email: email_adresses[0].email_adresses,
      name: first_name + ' ' + last_name,
      image: image_url
    }
    await User.findByIdAndUpdate(id, userData)
  }
)
// inngest function to cancel booking and release seats of show after 10 mins of booking created if payment is not available

const releaseSeatsAndDeletedBooking = inngest.createFunction(
  {id: 'release-seats-delete-booking'},
  {event: "app/checkpayment"},
  async({event, step})=> {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil('wait for 10 minutes', tenMinutesLater);
    await step.run('checking payment status', async()=> {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId)
       // check if payment is not made nullify the seats and delete booking status
       if(!booking.isPaid){
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat)=>{
          delete show.occupiedSeats[seat]
        });
        show.markModified('occupied seats')
        await show.save()
        await Booking.findByIdAndDelete(booking._id)
       }
    })
  }
)

export const functions = [
  syncUserCreation, 
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeletedBooking
];