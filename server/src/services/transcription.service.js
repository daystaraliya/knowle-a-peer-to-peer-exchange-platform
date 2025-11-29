import { Recording } from '../models/recording.models.js';
import { Exchange } from '../models/exchange.models.js';
import { transcribeAudioWithGemini } from '../utils/gemini.js';
import { ApiError } from '../utils/ApiError.js';
import axios from 'axios';

/**
 * Processes an audio recording for transcription.
 * This function is designed to be called asynchronously (fire-and-forget).
 * @param {string} recordingId - The ID of the recording document.
 * @param {object} io - The Socket.IO server instance for real-time notifications.
 */
export const processTranscription = async (recordingId, io) => {
    console.log(`Starting transcription process for recording: ${recordingId}`);
    let recording;

    try {
        recording = await Recording.findById(recordingId);
        if (!recording || recording.status !== 'processing') {
            console.log(`Recording ${recordingId} not found or already processed.`);
            return;
        }

        // 1. Download audio from Cloudinary
        const response = await axios.get(recording.url, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data, 'binary');

        // 2. Transcribe using Gemini
        const transcript = await transcribeAudioWithGemini(audioBuffer);
        if (!transcript) {
            throw new ApiError(500, "Transcription returned empty.");
        }

        // 3. Update recording in DB
        recording.transcript = transcript;
        recording.status = 'completed';
        await recording.save();

        console.log(`✅ Transcription completed for recording: ${recordingId}`);

        // 4. Notify users via WebSocket
        const exchange = await Exchange.findById(recording.exchange);
        if (exchange) {
            const initiatorRoom = `user-${exchange.initiator}`;
            const receiverRoom = `user-${exchange.receiver}`;
            const notification = {
                recordingId: recording._id,
                title: `Recording from ${new Date(recording.createdAt).toLocaleDateString()}`
            };
            io.to(initiatorRoom).to(receiverRoom).emit('transcriptReady', notification);
        }

    } catch (error) {
        console.error(`❌ Transcription failed for recording ${recordingId}:`, error.message);
        if (recording) {
            recording.status = 'failed';
            await recording.save();
        }
    }
};
