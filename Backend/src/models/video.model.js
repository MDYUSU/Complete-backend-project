import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
  {
    videoFile: {
      required: true,
      type: String, //cloudinary url
    },
    thumbnail: {
      required: true,
      type: String, //cloudinary url
    },
    title: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate)



export const Video = mongoose.model("Video", videoSchema);
