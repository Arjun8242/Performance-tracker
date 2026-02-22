import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false, timestamps: false }
);

const chatSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One persistent session per user
            index: true,
        },
        messages: {
            type: [messageSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
