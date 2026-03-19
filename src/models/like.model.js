import mongoose, { Schema } from "mongoose";

const likeSchema= new Schema({
    video:{
             type:Schema.Types.ObjectIdbjectId,
             ref:"Video"
    },
    comment:{
         type:Schema.Types.ObjectIdbjectId,
         ref:"Comment"
    },
    tweet:{
         type:Schema.Types.ObjectIdbjectId,
         ref:"Tweet"
    },

    likedBy:{
             type:Schema.Types.ObjectIdbjectId,
             ref:"User"
    }



},{timestamps:true})


export const Like= mongoose.model("Like",likeSchema);