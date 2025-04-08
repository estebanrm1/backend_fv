import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
}, { timestamps: true });

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;