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
    policies: {
   type: mongoose.Schema.Types.Mixed,
  default: [],
},
processing: {
    inProgress: { type: Boolean, default: false },

  },
  },
  
  { timestamps: true }
)

export const UserPolicies = mongoose.model("UserPolicies", UserPoliciesSchema);