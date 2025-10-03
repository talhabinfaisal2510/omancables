import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  popupImageUrl: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  strict: false,
  strictQuery: false,
});

// Delete cached model to force schema reload
if (mongoose.models.Speaker) {
  delete mongoose.models.Speaker;
}

const Speaker = mongoose.model('Speaker', speakerSchema);

export default Speaker;
