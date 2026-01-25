import z, { optional }  from 'zod';

export const checkMobileExistsSchema = z.object({
    mobile: z.string().regex(/^[1-9]\d{9}$/, "Invalid mobile number").min(10, "Mobile number must be at least 10 digits").max(10, "Mobile number must be at most 10 digits"),
});

export const signupSchema = z.object({
    mobile: z.string().regex(/^[1-9]\d{9}$/, "Invalid mobile number").min(10, "Mobile number must be at least 10 digits").max(10, "Mobile number must be at most 10 digits"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    source: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const adminsignupSchema = z.object({
    
    userName: z.string().min(2, "Name must be at least 2 characters"),
   
    password: z.string().min(8, "Password must be at least 8 characters"),
});



export const updatesSchema = z.object({
  mobile: z.string().regex(/^[1-9]\d{9}$/, "Invalid mobile number").min(10, "Mobile number must be at least 10 digits").max(10, "Mobile number must be at most 10 digits").optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100).optional(),

  email: z.email("Invalid email address").optional(),

  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be in YYYY-MM-DD format").optional(),

  gender: z
    .enum(["Male", "Female", "Transgender"]).optional(),

  occupation: z
    .string()
    .min(2)
    .max(100).optional(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128).optional(),
});




export const loanRequestSchema = z.object({
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"),

  mobileNo: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

  pinCode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Invalid PIN code"),

  dob: z
    .string()
   .regex(
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
  "DOB must be in YYYY-MM-DD format with valid month and day"
),

  loanAmount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Loan amount must be a valid positive number",
    }),

  customerName: z
    .string()
    .min(2)
    .max(100),
});


const vehicleNumberRegex =
  /^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}$/;


const mobileNumberRegex =
  /^[6-9]\d{9}$/;

export const MotorPolicySchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name is too long")
    .regex(/^[A-Za-z\s]+$/, "Full name must contain only letters and spaces"),

  vehicleNumber: z.string().toUpperCase().regex(vehicleNumberRegex, "Invalid vehicle number format"),
    

  mobileNumber: z.string().regex(mobileNumberRegex, "Invalid mobile number"),

  whatsappNumber: z
    .string()
    .regex(mobileNumberRegex, "Invalid WhatsApp number"),

  vehicleType: z.string().min(1, "Vehicle type is required"),

  paymentMode: z
    .enum(["Credit", "Prepaid"], {
      errorMap: () => ({
        message: "Payment mode must be Credit or Prepaid",
      }),
    }),
});



export const RudrakshSchema = z.object({
  prefix: z.enum(["Mr.", "Miss.", "Mrs.", "Ms."]),

  firstName: z
    .string()
    .min(2, "First name too short")
    .max(40),

  lastName: z
    .string()
    .min(2, "Last name too short")
    .max(80),

  dob: z
    .string()
    .regex(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
      "DOB must be in DD/MM/YYYY format"
    ),

  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),

  gender: z.enum(["M", "F", "O"]),

  email: z
    .email("Invalid email address"),

  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),

  nomineeName: z
    .string()
    .min(2)
    .max(255),

  nomineeRelation: z.enum([
    "Father",
    "Mother",
    "Wife",
    "Husband",
    "Son",
    "Daughter",
  ]),

  nomineeAge: z
    .number()
    .int()
    .min(0)
    .max(120),


});



export const HealthInsuranceSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name too short")
    .max(40),
    
    lastName: z
    .string()
    .min(2, "Last name too short")
    .max(80),
    
    email: z
      .email("Invalid email address"),
  
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
    insureFor: z.enum([
    "Self",
    "Spouse",
    "Son",
    "Daughter",
    "Father",
    "Mother",
  ]),


  whatsappNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid WhatsApp number")
    .optional(),

  pinCode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Invalid Indian pin code")
    .optional(),
});




export const PlanSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name too short")
    .max(40),
    
    lastName: z
    .string()
    .min(2, "Last name too short")
    .max(80),
    
    email: z
      .email("Invalid email address"),
  
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
    plan: z.enum([
    "Gold",
    "Silver",
  ]),
});

export const ReferandEarnSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name too short")
    .max(100, "Full name too long"),
  
    contactNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),

    relationship: z.enum([
      "Friend",
      "Family",
      "Neighbour",
      "Colleague",
      "Other"
    ]),
    insuranceType: z.enum([
      "Health",
      "Motor",
      "Life",
      "Rudraksh",
      "Rasgulla",
      "Helmet Theft"
    ]),
});



export const sendFilteredNotificationSchema = z.object({
  title: z.string().min(1, "title is required"),
  body: z.string().min(1, "body is required"),
  platform: z.union([z.literal("android"), z.literal("ios")]).optional(),
  state: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  occupation: z.string().min(1).optional(),
  interests: z.array(z.string().min(1)).optional(),
  
});
