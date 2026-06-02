import { z } from 'zod'

/**
 * Validation schema for the login payload.
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Must be a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
})

export type LoginInput = z.infer<typeof LoginSchema>

/**
 * Validation schema for individual user details inside the registration payload.
 */
export const UserRegisterSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  surName: z.string().min(1, { message: "Surname is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Must be a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  phoneNumber: z.string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\+\d{1,3}\d{6,14}$/, { message: "Owner phone must match format: +[country code][number] (e.g. +962791234567)" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender must be MALE or FEMALE" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }), // format: YYYY-MM-DD
  permissions: z.array(z.string()).default(["MANAGE_DOCTORS", "MANAGE_SECRETARIES"]),
})

export const OwnerRegisterSchema = z.object({
  user: UserRegisterSchema,
  specialty: z.string().min(1, { message: "Specialty is required" }),
  summary: z.string().min(1, { message: "Summary is required" }),
})

/**
 * Validation schema for the registration payload.
 */
export const ClinicSettingsSchema = z.object({
  defaultCurrency: z.string().default("JOD"),
  defaultAppointmentPeriod: z.number().default(30),
})

/**
 * Validation schema for the registration payload.
 */
export const RegisterSchema = z.object({
  name: z.string().min(1, { message: "Clinic name is required" }),
  medicalCategory: z.string().min(1, { message: "Medical category is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  city: z.string().min(1, { message: "City is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  phoneNumber: z.string()
    .min(1, { message: "Clinic phone number is required" })
    .regex(/^\+\d{1,3}\d{6,14}$/, { message: "Clinic phone must match format: +[country code][number] (e.g. +962791234567)" }),
  email: z.string().min(1, { message: "Clinic email is required" }).email({ message: "Must be a valid email address" }),
  settings: ClinicSettingsSchema.default({ defaultCurrency: "JOD", defaultAppointmentPeriod: 30 }),
  owner: OwnerRegisterSchema,
})

export type RegisterInput = z.infer<typeof RegisterSchema>
