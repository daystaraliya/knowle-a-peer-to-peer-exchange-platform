import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.models.js";
import mongoose from "mongoose";

const createEvent = asyncHandler(async (req, res) => {
    if (req.user.role !== 'mentor') {
        throw new ApiError(403, "Only mentors are allowed to create events.");
    }

    const { title, description, topic, eventDate, durationMinutes, maxAttendees } = req.body;
    if (!title || !description || !topic || !eventDate || !durationMinutes || !maxAttendees) {
        throw new ApiError(400, "All event fields are required.");
    }

    const event = await Event.create({
        title,
        description,
        topic,
        eventDate,
        durationMinutes,
        maxAttendees,
        host: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, event, "Event created successfully."));
});

const getAllEvents = asyncHandler(async (req, res) => {
    const { topic } = req.query;
    const query = {
        status: 'upcoming', // Only show upcoming events
        eventDate: { $gte: new Date() } // Filter out past events
    };

    if (topic) {
        query.topic = topic;
    }

    const events = await Event.find(query)
        .populate('host', 'fullName avatar username')
        .populate('topic', 'name')
        .sort({ eventDate: 1 });

    return res.status(200).json(new ApiResponse(200, events, "Upcoming events retrieved successfully."));
});

const getEventById = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Invalid event ID.");
    }

    const event = await Event.findById(eventId)
        .populate('host', 'fullName avatar username')
        .populate('topic', 'name')
        .populate('attendees', 'fullName avatar username');

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    return res.status(200).json(new ApiResponse(200, event, "Event details retrieved successfully."));
});

const registerForEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found.");
    if (event.status !== 'upcoming') throw new ApiError(400, "Registration is closed for this event.");
    if (event.host.equals(userId)) throw new ApiError(400, "You cannot register for an event you are hosting.");
    if (event.attendees.length >= event.maxAttendees) throw new ApiError(400, "This event is already full.");
    if (event.attendees.includes(userId)) throw new ApiError(409, "You are already registered for this event.");

    event.attendees.push(userId);
    await event.save();
    
    return res.status(200).json(new ApiResponse(200, event, "Successfully registered for the event."));
});

const cancelRegistration = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found.");

    const attendeeIndex = event.attendees.indexOf(userId);
    if (attendeeIndex === -1) {
        throw new ApiError(404, "You are not registered for this event.");
    }

    event.attendees.splice(attendeeIndex, 1);
    await event.save();
    
    return res.status(200).json(new ApiResponse(200, event, "Your registration has been cancelled."));
});

const getHostedEvents = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const events = await Event.find({ host: userId, status: 'upcoming' }).sort({ eventDate: 1 });
    return res.status(200).json(new ApiResponse(200, events, "Hosted events retrieved."));
});

const getRegisteredEvents = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const events = await Event.find({ attendees: userId, status: 'upcoming' }).sort({ eventDate: 1 });
    return res.status(200).json(new ApiResponse(200, events, "Registered events retrieved."));
});

export {
    createEvent,
    getAllEvents,
    getEventById,
    registerForEvent,
    cancelRegistration,
    getHostedEvents,
    getRegisteredEvents,
};