
import mongoose from "mongoose";

const tutorialVideoSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: true,
        trim: true
    }   
});

export const TutorialVideo = mongoose.model("TutorialVideo", tutorialVideoSchema);