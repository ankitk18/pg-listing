import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: String,
        required: true,
      },
    ], // Array of user IDs
    pgId:{
        type:String,
        required: true
    },
    pgName: {
      type: String,
      required: true,
    }, // Name of the PG
  },
  { timestamps: true }
);
chatSchema.index({ participants: 1, pgId: 1 }, { unique: true });

chatSchema.statics.findOrCreate = async function (participants, pgId, pgName) {
  const sortedParticipants = participants.sort();
  
    const chat = await this.create({
      participants: sortedParticipants,
      pgId: pgId,
      pgName: pgName,
    });
  return chat;
};

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
