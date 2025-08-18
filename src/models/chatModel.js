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
  },
  { timestamps: true }
);
chatSchema.index({ participants: 1, pgId: 1 }, { unique: true });

chatSchema.statics.findOrCreate = async function (participants, pgId) {
  const sortedParticipants = participants.sort();
  
    const chat = await this.create({
      participants: sortedParticipants,
      pgId: pgId
    });
  return chat;
};

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
