import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  primaryKey,
  json,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  githubUsername: text("github_username"),
  githubAvatar: text("github_avatar"),
  displayName: text("display_name").notNull(),
  email: text("email"),
  bio: text("bio"),
  website: text("website"),
  twitterLink: text("twitter_link"),
  linkedinLink: text("linkedin_link"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const startupViews = pgTable("startup_views", {
  clerkId: text("clerk_id").notNull(),
  startupId: integer("startup_id").notNull().references(() => startups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.clerkId, table.startupId] }),
]);

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  videoUrl: text("video_url").notNull(),
  videoTitle: text("video_title"),
  content: text("content").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  name: text("name").notNull(),
  repoName: text("repo_name").notNull(),
  repoUrl: text("repo_url"),
  files: text("files").default("[]").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("present"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webProjects = pgTable("web_projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  createdBy: text("created_by").notNull(),
  createdOn: timestamp("created_on").defaultNow(),
});

export const webFrames = pgTable("web_frames", {
  id: serial("id").primaryKey(),
  frameId: text("frame_id").notNull().unique(),
  designCode: text("design_code"),
  projectId: text("project_id").notNull().references(() => webProjects.projectId),
  createdOn: timestamp("created_on").defaultNow(),
});

export const webChats = pgTable("web_chats", {
  id: serial("id").primaryKey(),
  chatMessage: json("chat_message").notNull(),
  frameId: text("frame_id").references(() => webFrames.frameId),
  createdBy: text("created_by").notNull(),
  createdOn: timestamp("created_on").defaultNow(),
});

export const diagrams = pgTable("diagrams", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  name: text("name").default("Untitled Diagram").notNull(),
  elements: json("elements"),
  appState: json("app_state"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const canvaDesigns = pgTable("canva_designs", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  name: text("name").default("Untitled Design").notNull(),
  canvasJson: json("canvas_json"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const startups = pgTable("startups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  pitch: text("pitch"),
  authorId: text("author_id").notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiStories = pgTable("ai_stories", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  title: text("title").notNull(),
  content: json("content").$type<{ text: string; imageUrl: string }[]>().default([]),
  ageGroup: text("age_group"),
  genre: text("genre"),
  artStyle: text("art_style"),
  characterName: text("character_name"),
  coverImageUrl: text("cover_image_url"),
  audioUrl: text("audio_url"),
  isPublic: text("is_public").default("false"),
  creditsUsed: integer("credits_used").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const startupPins = pgTable("startup_pins", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  tags: text("tags"),
  isAiGenerated: text("is_ai_generated").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiCredits = pgTable("ai_credits", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  credits: integer("credits").default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
