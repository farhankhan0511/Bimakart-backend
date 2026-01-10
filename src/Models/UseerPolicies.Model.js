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
<<<<<<< HEAD
processing: {
    inProgress: { type: Boolean, default: false },

  },
  },
=======
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
 
>>>>>>> 8085e14 (added logging and removed locking bug)
  
  { timestamps: true }
)

export const UserPolicies = mongoose.model("UserPolicies", UserPoliciesSchema);