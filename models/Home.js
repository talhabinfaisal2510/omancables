import mongoose from 'mongoose';

const homeSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true,
  },
}, {
  timestamps: true,
});


const Home = mongoose.models.Home || mongoose.model('Home', homeSchema);
export default Home;