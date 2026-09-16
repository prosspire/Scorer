import * as z from "zod";

export const BattleFormSchema = z
  .object({
    title: z.string().min(5, {
      message: "Battle title is too short (minimum 5 characters)",
    }).max(100, {
      message: "Battle title is too long (maximum 100 characters)",
    }),
    
    participant_a_username: z.string().min(3, {
      message: "Username is too short (minimum 3 characters)",
    }).max(30, {
      message: "Username is too long (maximum 30 characters)",
    }).regex(/^[a-zA-Z0-9._]+$/, {
      message: "Username can only contain letters, numbers, dots, and underscores",
    }),
    
    participant_b_username: z.string().min(3, {
      message: "Username is too short (minimum 3 characters)",
    }).max(30, {
      message: "Username is too long (maximum 30 characters)",
    }).regex(/^[a-zA-Z0-9._]+$/, {
      message: "Username can only contain letters, numbers, dots, and underscores",
    }),
    
    participant_a_image: z.string().url({
      message: "Invalid image URL for participant A",
    }).optional().or(z.literal("")),
    
    participant_b_image: z.string().url({
      message: "Invalid image URL for participant B",
    }).optional().or(z.literal("")),
    
    participant_a_followers: z.string().min(1, {
      message: "Follower count is required for participant A",
    }),
    
    participant_b_followers: z.string().min(1, {
      message: "Follower count is required for participant B",
    }),
    
    description: z.string().min(10, {
      message: "Description is too short (minimum 10 characters)",
    }).max(500, {
      message: "Description is too long (maximum 500 characters)",
    }),
    
    status: z.boolean().default(true),
    
    creator: z.string().min(1, {
      message: "Creator ID is required",
    }),
    
    created_at: z.string().min(1, {
      message: "Creation date is required",
    }),
    
    slug: z.string().min(1, {
      message: "Battle slug is required",
    }),
    
    voting_enabled: z.boolean().default(true),
    
    battle_duration: z.string().refine(
      (val) => ["1", "6", "12", "24", "48", "168"].includes(val),
      {
        message: "Invalid battle duration",
      }
    ).default("24"),
    
    category: z.enum([
      "general",
      "lifestyle", 
      "fitness",
      "fashion",
      "tech",
      "entertainment"
    ], {
      errorMap: () => ({ message: "Please select a valid category" })
    }).default("general"),
  })
  .refine(
    (data) => {
      return data.participant_a_username !== data.participant_b_username;
    },
    {
      message: "Participants must have different usernames",
      path: ["participant_b_username"],
    }
  )
  .refine(
    (data) => {
      // If image URLs are provided, validate they're from allowed sources
      if (data.participant_a_image && data.participant_a_image !== "") {
        try {
          const url = new URL(data.participant_a_image);
          return url.hostname === "images.unsplash.com" || 
                 url.hostname === "unsplash.com" ||
                 url.hostname.endsWith(".cloudinary.com") ||
                 url.hostname.endsWith(".amazonaws.com");
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Participant A image must be from supported sources (Unsplash, Cloudinary, or AWS)",
      path: ["participant_a_image"],
    }
  )
  .refine(
    (data) => {
      // If image URLs are provided, validate they're from allowed sources
      if (data.participant_b_image && data.participant_b_image !== "") {
        try {
          const url = new URL(data.participant_b_image);
          return url.hostname === "images.unsplash.com" || 
                 url.hostname === "unsplash.com" ||
                 url.hostname.endsWith(".cloudinary.com") ||
                 url.hostname.endsWith(".amazonaws.com");
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Participant B image must be from supported sources (Unsplash, Cloudinary, or AWS)",
      path: ["participant_b_image"],
    }
  );

export type BattleFormSchemaType = z.infer<typeof BattleFormSchema>;

// Optional: Export interface for battle detail type
export interface IBattleDetail {
  id?: string;
  title: string;
  participant_a_username: string;
  participant_b_username: string;
  participant_a_image?: string;
  participant_b_image?: string;
  participant_a_followers: string;
  participant_b_followers: string;
  description: string;
  status: boolean;
  creator: string;
  created_at: string;
  slug: string;
  voting_enabled: boolean;
  battle_duration: string;
  category: string;
  // Additional fields that might be added by the backend
  participant_a_votes?: number;
  participant_b_votes?: number;
  total_votes?: number;
  ends_at?: string;
  is_active?: boolean;
}

export const CourseFormSchema = z
	.object({
		Catogory_id: z.string().min(20, {
			message: "Content is too short",
		}),
		banner_image: z.string().url({
			message: "Invalid url",
		}),
		Description: z.string(),
		instructor: z.string(),
		created_at: z.string(),
		Name: z.string(),
		price: z.string(),
		slug: z.string(),
	})


export type CourseFormSchematype = z.infer<typeof CourseFormSchema>;

export const Chapterformschema = z
	.object({
		content: z.string().min(20, {
			message: "Content is too short",
		}),
		chapter_name: z.string().url({
			message: "Invalid url",
		}),
		image:z.string(),
		chapterno: z.string(),
		created_at: z.string(),
		instructor: z.string(),
		module_id: z.string(),
		slug: z.string(),
		catagory_id: z.number(),
		course_id: z.string(),
		description: z.string(),
		pdffiles: z.string(),
	})


export type Chapterformschematype = z.infer<typeof Chapterformschema>;