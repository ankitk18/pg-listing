import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    message: {
        senderId: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timeStamp: {
          type: Date,
          default: Date.now,
        },
    },
    pgId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", messageSchema);