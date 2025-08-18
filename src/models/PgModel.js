import mongoose from "mongoose";

const pgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nearByCollege: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
    images: {
    type: [String]
  },
  amenities: {
    type: [String],
    required: true,
  },
  userId: {
    type: String,
    required: true,
  }
},{timestamps: true}); 

export default mongoose.models.PgList || mongoose.model("PgList", pgSchema);