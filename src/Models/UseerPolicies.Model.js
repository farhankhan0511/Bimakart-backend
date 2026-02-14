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
   type: [Object],
  default: [],
},

   processing: {
    inProgress: {
      type: Boolean,
      default: false,
      index: true,
    },
    startedAt: {
      type: Date,
      index: true, // needed for TTL logic
    },
    lockId:{
      type:String
    }
  },

  },
 
  
  { timestamps: true }
)
UserPoliciesSchema.index(
  { mobile: 1, "policies.id": 1 },
  { unique: true, sparse: true }
);

export const UserPolicies = mongoose.model("UserPolicies", UserPoliciesSchema);