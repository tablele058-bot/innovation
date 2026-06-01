import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  primaryKey,
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
