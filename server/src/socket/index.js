import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { Message } from '../models/message.models.js';
import { Exchange } from '../models/exchange.models.js';
import mongoose from 'mongoose';

const initializeSocketIO = (io) => {
    
    // Middleware for authentication using httpOnly cookies
    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) {
                return next(new Error('Authentication error: No cookies provided'));
            }

            // A simple cookie parser
            const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=').map(decodeURIComponent)));
            const token = cookies.accessToken;

            if (!token) {
                return next(new Error('Authentication error: Token not provided'));
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select('_id');
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ A user connected:', socket.user._id);

        // Join a personal room for notifications
        socket.join(`user-${socket.user._id}`);
        console.log(`User ${socket.user._id} joined room user-${socket.user._id}`);

        socket.on('joinExchange', (exchangeId) => {
            socket.join(`exchange-${exchangeId}`);
            console.log(`User ${socket.user._id} joined room exchange-${exchangeId}`);
        });

        socket.on('leaveExchange', (exchangeId) => {
            socket.leave(`exchange-${exchangeId}`);
            console.log(`User ${socket.user._id} left room exchange-${exchangeId}`);
        });

        socket.on('sendMessage', async (data) => {
            const { exchangeId, content } = data;

            if (!mongoose.Types.ObjectId.isValid(exchangeId)) {
                return socket.emit('sendMessageError', { message: 'Invalid exchange ID.' });
            }

            try {
                const exchange = await Exchange.findById(exchangeId);
                if (!exchange) {
                    return socket.emit('sendMessageError', { message: 'Exchange not found.' });
                }
                
                const isParticipant = exchange.initiator.equals(socket.user._id) || exchange.receiver.equals(socket.user._id);
                if (!isParticipant) {
                    return socket.emit('sendMessageError', { message: 'Unauthorized to send message to this exchange.' });
                }
                
                const receiverId = exchange.initiator.equals(socket.user._id)
                    ? exchange.receiver
                    : exchange.initiator;

                const message = await Message.create({
                    sender: socket.user._id,
                    receiver: receiverId,
                    exchange: exchangeId,
                    content
                });
                
                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'fullName avatar');
                
                io.to(`exchange-${exchangeId}`).emit('newMessage', populatedMessage);
                
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('sendMessageError', { message: 'Could not send message.' });
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ A user disconnected:', socket.user._id);
        });
    });
};

export { initializeSocketIO };