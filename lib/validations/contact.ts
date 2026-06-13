import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid work email"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().optional(),
  message: z.string().min(10, "Please tell us a bit more about your needs"),
  source: z.string().optional(),
  website: z.string().max(0, "Invalid submission"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
