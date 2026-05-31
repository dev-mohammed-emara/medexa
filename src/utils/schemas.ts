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
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender must be MALE or FEMALE" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }), // format: YYYY-MM-DD
  permissions: z.array(z.string()).default(["MANAGE_DOCTORS", "MANAGE_SECRETARIES"]),
})

/**
 * Validation schema for the registration payload.
 */
export const RegisterSchema = z.object({
  role: z.literal("ROLE_CLINIC_OWNER"),
  user: UserRegisterSchema,
})

export type RegisterInput = z.infer<typeof RegisterSchema>
