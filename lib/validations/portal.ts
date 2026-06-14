import { z } from "zod";

export const ticketCreateSchema = z.object({
  summary: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  issueType: z.enum(["Feature", "Bug", "Request", "Task"]),
  priority: z.enum(["Highest", "High", "Medium", "Low", "Lowest"]).optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const rankSchema = z.object({
  issueKey: z.string().regex(/^KAN-\d+$/),
  rankBeforeIssue: z.string().regex(/^KAN-\d+$/).optional(),
  rankAfterIssue: z.string().regex(/^KAN-\d+$/).optional(),
});

export const moveIssuesSchema = z.object({
  issueKeys: z.array(z.string().regex(/^KAN-\d+$/)).min(1).max(50),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["administrator", "standard"]).default("standard"),
  fullName: z.string().min(1).max(120).optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["administrator", "standard"]),
});
