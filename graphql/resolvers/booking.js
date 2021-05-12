const Event = require('../../models/event');
const Booking = require('../../models/booking');
const {transformBooking, transformEvent } = require('./merge');

module.exports = {
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            const bookings = await Booking.find({user: req.userId});
            return bookings.map(booking => {
                return transformBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args, req) => {
        console.log("hit book event")
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        const fetchedEvent = await Event.findOne({ _id: args.eventId })
        const booking = new Booking({
            user: req.userId,
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking: async (args, req) => {
        console.log("you hit me in cancel")
        if (!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        try {
            console.log("you hit me in try", args)
            const booking = await Booking.findById(args.bookingID).populate('event');
                const event = transformEvent(booking.event);
                await Booking.deleteOne({ _id: args.bookingID });  
                return event;    
        } catch (err) {
            throw err;
        }
    }
};