const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');

const transformEvent = event => {
    return {
        ...event._doc, 
        _id: event.id, 
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator) 
    };
};

const transformBooking = booking => {
    return {
        ...booking._doc, 
        _id: booking.id,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event), 
        createdAt: dateToString(booking._doc.createdAt),  
        updatedAt: dateToString(booking._doc.updatedAt)
    }
}

const events = eventIds => {
    return Event.find({ _id: {$in: eventIds } })
        .then(events => {
            return events.map(event => {
                return transformEvent(event);
            });
        })
        .catch(err => {
            throw err;
        });
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (err) {
        throw err
    }
}

const user = userId => {
    return User.findById(userId)
    .then(user => {
        return { 
            ...user._doc, 
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    })
    .catch(err => {
        throw err;
    });
}

module.exports = {
    events: () => {
        return Event.find()
            .then(events => {
                return events.map(event => {
                    return transformEvent(event);
                });
            })
            .catch(err => {
                throw err;
            });
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '6092fcca691f4d4de9cda267'
        });
        let createdEvent;
        return event
            .save()
            .then(result => {
                createdEvent = transformEvent(result);
                return User.findById('6092fcca691f4d4de9cda267')
            })
            .then(user => {
                if (!user) {
                    throw new Error('User was not found.')
                }
                user.createdEvents.push(event);
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    createUser: args => {
        return User.findOne({email: args.userInput.email})
        .then(user => {
            if (user) {
                throw new Error('User already exists.')
            }
            return bcrypt
            .hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            return { ...result._doc, password: null, _id: result.id };
        })
        .catch(err => {
            throw err;
        });
    },
    bookEvent: async args => {
        const event = await Event.findOne({ _id: args.eventId })
        const booking = new Booking({
            user: '6092fcca691f4d4de9cda267',
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId)
            .populate('event');
                const event = transformEvent(booking.event);
                await Booking.deleteOne({ _id: args.bookingId });  
                return event;    
        } catch (err) {
            throw err;
        }
    }
};