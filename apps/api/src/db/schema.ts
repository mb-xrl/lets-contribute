import { boolean, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Neon Postgres schema (Drizzle ORM).
 * `npm run db:setup` applies the matching DDL from src/db/schema.sql and seeds
 * demo content. Both files must be kept in sync.
 */

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  githubId: text('github_id').unique(),
  login: text('login').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  location: text('location'),
  githubUrl: text('github_url'),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  repoUrl: text('repo_url'),
  tags: text('tags').array().notNull().default([]),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const posts = pgTable(
  'posts',
  {
    id: text('id').primaryKey(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    tags: text('tags').array().notNull().default([]),
    skills: text('skills').array().notNull().default([]),
    repoUrl: text('repo_url'),
    repoName: text('repo_name'),
    difficulty: text('difficulty'),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('posts_type_idx').on(table.type),
    index('posts_author_idx').on(table.authorId),
    index('posts_created_at_idx').on(table.createdAt),
  ],
);

export const votes = pgTable(
  'votes',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const comments = pgTable(
  'comments',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('comments_post_idx').on(table.postId)],
);

export type UserRow = typeof users.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type CommentRow = typeof comments.$inferSelect;
export type VoteRow = typeof votes.$inferSelect;
