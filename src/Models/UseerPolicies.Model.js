import mongoose from "mongoose";




const UserPoliciesSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
        unique: true,
        index: true,
        trim: true,
    },
    uploadedpolicy:{type:[Object],default:[]},
    policies: {
   type: [Object],
  default: [],
},
processing: {
    inProgress: { type: Boolean, default: false },

  },
  },
  
  { timestamps: true }
)

export const UserPolicies = mongoose.model("UserPolicies", UserPoliciesSchema);