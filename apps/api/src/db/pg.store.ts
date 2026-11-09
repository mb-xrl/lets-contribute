import { Injectable, Logger } from '@nestjs/common';
import { neon } from '@neondatabase/serverless';
import { and, eq, sql, type SQL } from 'drizzle-orm';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  PAGE_SIZE,
  type Author,
  type Comment,
  type Difficulty,
  type Paginated,
  type Post,
  type PostQuery,
  type PostType,
  type Project,
  type ProjectInput,
  type PublicUser,
  type Stats,
  type TagCount,
} from '@lets-contribute/shared';
import { config } from '../config';
import { newId, slugify } from '../domain/ids';
import { seed } from '../domain/seed';
import type {
  CreatePostInput,
  GitHubProfile,
  Store,
  StoredComment,
  StoredPost,
  StoredProject,
  StoredUser,
} from '../domain/store';
import { comments, posts, projects, users, votes } from './schema';

type Row = Record<string, any>;

const toIso = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
};

const toDate = (value: unknown): Date => new Date(toIso(value));

const normaliseTags = (tags: string[] | undefined): string[] =>
  Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-'))
        .filter((tag) => tag.length > 0 && tag.length <= 32),
    ),
  ).slice(0, 8);

const normaliseSkills = (skills: string[] | undefined): string[] =>
  Array.from(
    new Set((skills ?? []).map((skill) => skill.trim()).filter((skill) => skill.length > 0)),
  ).slice(0, 10);

/** Shared SELECT projection so list/detail stay in sync. */
const postSelect = (viewerId: string | null) => sql`
  SELECT
    p.id,
    p.type,
    p.title,
    p.body,
    p.tags,
    p.skills,
    p.repo_url,
    p.repo_name,
    p.difficulty,
    p.created_at,
    p.updated_at,
    u.id          AS author_id,
    u.login       AS author_login,
    u.name        AS author_name,
    u.avatar_url  AS author_avatar,
    u.is_demo     AS author_is_demo,
    pr.id         AS project_id,
    pr.slug       AS project_slug,
    pr.name       AS project_name,
    (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id)::int AS vote_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)::int AS comment_count,
    ${
      viewerId
        ? sql`EXISTS (SELECT 1 FROM votes vv WHERE vv.post_id = p.id AND vv.user_id = ${viewerId})`
        : sql`false`
    } AS viewer_voted,
    ${viewerId ? sql`(p.author_id = ${viewerId})` : sql`false`} AS viewer_is_author
  FROM posts p
  JOIN users u ON u.id = p.author_id
  LEFT JOIN projects pr ON pr.id = p.project_id
`;

/**
 * Neon Postgres implementation (HTTP driver — works in serverless functions).
 */
@Injectable()
export class PgStore implements Store {
  readonly kind = 'postgres' as const;
  private readonly logger = new Logger('PgStore');
  private readonly db: NeonHttpDatabase<Record<string, never>>;

  constructor() {
    if (!config.databaseUrl) throw new Error('DATABASE_URL is required for PgStore');
    this.db = drizzle({ client: neon(config.databaseUrl) });
  }

  /** Normalises the two shapes `db.execute` can return across drivers. */
  private async rows(query: SQL): Promise<Row[]> {
    const result: any = await this.db.execute(query);
    if (Array.isArray(result)) return result as Row[];
    return (result?.rows ?? []) as Row[];
  }

  private authorFromRow(row: Row, prefix = ''): Author {
    const key = (name: string) => (prefix ? row[`${prefix}_${name}`] : row[name]);
    return {
      id: String(key('id') ?? ''),
      login: String(key('login') ?? 'unknown'),
      name: String(key('name') ?? 'Unknown'),
      avatarUrl: (key('avatar') as string | null) ?? null,
      isDemo: Boolean(key('is_demo')),
    };
  }

  private mapPost(row: Row): Post {
    return {
      id: String(row.id),
      type: row.type as PostType,
      title: String(row.title),
      body: String(row.body),
      tags: (row.tags as string[]) ?? [],
      skills: (row.skills as string[]) ?? [],
      repoUrl: (row.repo_url as string | null) ?? null,
      repoName: (row.repo_name as string | null) ?? null,
      difficulty: (row.difficulty as Difficulty | null) ?? null,
      project: row.project_slug
        ? {
            id: String(row.project_id),
            slug: String(row.project_slug),
            name: String(row.project_name),
          }
        : null,
      author: this.authorFromRow(row, 'author'),
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at),
      votes: Number(row.vote_count ?? 0),
      commentCount: Number(row.comment_count ?? 0),
      viewerVoted: Boolean(row.viewer_voted),
      viewerIsAuthor: Boolean(row.viewer_is_author),
    };
  }

  private mapProject(row: Row): Project {
    return {
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name),
      description: String(row.description),
      repoUrl: (row.repo_url as string | null) ?? null,
      tags: (row.tags as string[]) ?? [],
      owner: this.authorFromRow(row, 'owner'),
      createdAt: toIso(row.created_at),
      discussionCount: Number(row.discussion_count ?? 0),
      commentCount: Number(row.comment_count ?? 0),
      lastActivityAt: toIso(row.last_activity_at ?? row.created_at),
    };
  }

  private toStoredUser(row: Row): StoredUser {
    return {
      id: String(row.id),
      githubId: (row.github_id as string | null) ?? null,
      login: String(row.login),
      name: String(row.name),
      avatarUrl: (row.avatar_url as string | null) ?? null,
      bio: (row.bio as string | null) ?? null,
      location: (row.location as string | null) ?? null,
      githubUrl: (row.github_url as string | null) ?? null,
      isDemo: Boolean(row.is_demo),
      createdAt: toIso(row.created_at),
    };
  }

  private static readonly projectSelect = sql`
    SELECT
      pr.id, pr.slug, pr.name, pr.description, pr.repo_url, pr.tags, pr.created_at,
      u.id AS owner_id, u.login AS owner_login, u.name AS owner_name,
      u.avatar_url AS owner_avatar, u.is_demo AS owner_is_demo,
      (SELECT COUNT(*) FROM posts p WHERE p.project_id = pr.id)::int AS discussion_count,
      (SELECT COUNT(*) FROM comments c JOIN posts p ON p.id = c.post_id WHERE p.project_id = pr.id)::int AS comment_count,
      COALESCE(
        (SELECT MAX(p.updated_at) FROM posts p WHERE p.project_id = pr.id),
        pr.created_at
      ) AS last_activity_at
    FROM projects pr
    JOIN users u ON u.id = pr.owner_id
  `;

  async seedIfEmpty(): Promise<{ seeded: boolean }> {
    const [row] = await this.rows(sql`SELECT COUNT(*)::int AS count FROM users`);
    if (Number(row?.count ?? 0) > 0) return { seeded: false };

    this.logger.log('Empty database detected — seeding demo content');

    await this.db.insert(users).values(
      [...seed.users, seed.demoUser].map((user) => ({
        id: user.id,
        githubId: null,
        login: user.login,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        githubUrl: user.githubUrl || null,
        isDemo: user.isDemo,
        createdAt: toDate(user.createdAt),
      })),
    );

    await this.db.insert(projects).values(
      seed.projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        name: project.name,
        description: project.description,
        repoUrl: project.repoUrl,
        tags: project.tags,
        ownerId: project.ownerId,
        createdAt: toDate(project.createdAt),
      })),
    );

    await this.db.insert(posts).values(
      seed.posts.map((post) => ({
        id: post.id,
        authorId: post.authorId,
        type: post.type,
        title: post.title,
        body: post.body,
        tags: post.tags,
        skills: post.skills,
        repoUrl: post.repoUrl,
        repoName: post.repoName,
        difficulty: post.difficulty,
        projectId: post.projectId,
        createdAt: toDate(post.createdAt),
        updatedAt: toDate(post.updatedAt),
      })),
    );

    await this.db.insert(comments).values(
      seed.comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        body: comment.body,
        createdAt: toDate(comment.createdAt),
      })),
    );

    const voteRows = seed.posts.flatMap((post) =>
      post.voters.map((userId) => ({ postId: post.id, userId })),
    );
    if (voteRows.length) await this.db.insert(votes).values(voteRows);

    this.logger.log('Seed complete');
    return { seeded: true };
  }

  // ---------------------------------------------------------------- users

  async upsertGitHubUser(profile: GitHubProfile): Promise<StoredUser> {
    const [existing] = await this.rows(sql`
      SELECT * FROM users
      WHERE github_id = ${profile.id} OR lower(login) = lower(${profile.login})
      LIMIT 1
    `);

    if (existing) {
      const [updated] = await this.db
        .update(users)
        .set({
          githubId: profile.id,
          login: profile.login,
          name: profile.name || String(existing.name),
          avatarUrl: profile.avatarUrl ?? (existing.avatar_url as string | null),
          bio: (existing.bio as string | null) ?? profile.bio,
          location: (existing.location as string | null) ?? profile.location,
          githubUrl: profile.htmlUrl,
          isDemo: false,
        })
        .where(eq(users.id, String(existing.id)))
        .returning();
      return this.toStoredUser(updated);
    }

    const [inserted] = await this.db
      .insert(users)
      .values({
        id: newId(),
        githubId: profile.id,
        login: profile.login,
        name: profile.name || profile.login,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        location: profile.location,
        githubUrl: profile.htmlUrl,
        isDemo: false,
      })
      .returning();
    return this.toStoredUser(inserted);
  }

  async createDemoUser(): Promise<StoredUser> {
    const [existing] = await this.rows(sql`SELECT * FROM users WHERE id = ${seed.demoUser.id} LIMIT 1`);
    if (existing) return this.toStoredUser(existing);

    const [inserted] = await this.db
      .insert(users)
      .values({
        id: seed.demoUser.id,
        login: seed.demoUser.login,
        name: seed.demoUser.name,
        bio: seed.demoUser.bio,
        location: seed.demoUser.location,
        isDemo: true,
      })
      .returning();
    return this.toStoredUser(inserted);
  }

  async findUserById(id: string): Promise<StoredUser | null> {
    const [row] = await this.rows(sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`);
    return row ? this.toStoredUser(row) : null;
  }

  async findUserByLogin(login: string): Promise<StoredUser | null> {
    const [row] = await this.rows(
      sql`SELECT * FROM users WHERE lower(login) = lower(${login}) LIMIT 1`,
    );
    return row ? this.toStoredUser(row) : null;
  }

  async updateProfile(id: string, patch: { bio?: string; location?: string }): Promise<StoredUser> {
    const [updated] = await this.db
      .update(users)
      .set({
        ...(patch.bio !== undefined ? { bio: patch.bio.slice(0, 280) } : {}),
        ...(patch.location !== undefined ? { location: patch.location.slice(0, 80) } : {}),
      })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new Error('user_not_found');
    return this.toStoredUser(updated);
  }

  async getPublicUser(login: string): Promise<PublicUser | null> {
    const [row] = await this.rows(sql`
      SELECT
        u.*,
        (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id)::int AS post_count,
        (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id AND p.type = 'idea')::int AS idea_count,
        (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id AND p.type = 'discussion')::int AS discussion_count,
        (SELECT COUNT(*) FROM comments c WHERE c.author_id = u.id)::int AS comment_count,
        (SELECT COUNT(*) FROM votes v JOIN posts p ON p.id = v.post_id WHERE p.author_id = u.id)::int AS votes_received
      FROM users u
      WHERE lower(u.login) = lower(${login})
      LIMIT 1
    `);
    if (!row) return null;
    const user = this.toStoredUser(row);
    return {
      id: user.id,
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isDemo: user.isDemo,
      bio: user.bio,
      location: user.location,
      githubUrl: user.githubUrl,
      createdAt: user.createdAt,
      contributions: {
        posts: Number(row.post_count ?? 0),
        ideas: Number(row.idea_count ?? 0),
        discussions: Number(row.discussion_count ?? 0),
        comments: Number(row.comment_count ?? 0),
        votesReceived: Number(row.votes_received ?? 0),
      },
    };
  }

  // ---------------------------------------------------------------- posts

  async listPosts(query: PostQuery, viewerId: string | null): Promise<Paginated<Post>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || PAGE_SIZE));
    const offset = (page - 1) * pageSize;

    const filters: SQL[] = [];
    if (query.type && query.type !== 'all') filters.push(sql`p.type = ${query.type}`);
    if (query.tag) filters.push(sql`${query.tag.toLowerCase()} = ANY(p.tags)`);
    if (query.author) filters.push(sql`lower(u.login) = lower(${query.author})`);
    if (query.project) filters.push(sql`pr.slug = ${query.project}`);
    if (query.q?.trim()) {
      const like = `%${query.q.trim()}%`;
      filters.push(
        sql`(p.title ILIKE ${like} OR p.body ILIKE ${like} OR array_to_string(p.tags, ' ') ILIKE ${like})`,
      );
    }
    const where = filters.length ? sql`WHERE ${sql.join(filters, sql` AND `)}` : sql``;

    const order =
      query.sort === 'top'
        ? sql`ORDER BY vote_count DESC, p.created_at DESC`
        : query.sort === 'discussed'
          ? sql`ORDER BY comment_count DESC, p.created_at DESC`
          : sql`ORDER BY p.created_at DESC`;

    const [countRow] = await this.rows(sql`
      SELECT COUNT(*)::int AS total
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN projects pr ON pr.id = p.project_id
      ${where}
    `);

    const rows = await this.rows(sql`
      ${postSelect(viewerId)}
      ${where}
      ${order}
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    return {
      items: rows.map((row) => this.mapPost(row)),
      total: Number(countRow?.total ?? 0),
      page,
      pageSize,
    };
  }

  async getPost(id: string, viewerId: string | null): Promise<Post | null> {
    const [row] = await this.rows(sql`${postSelect(viewerId)} WHERE p.id = ${id} LIMIT 1`);
    return row ? this.mapPost(row) : null;
  }

  async createPost(authorId: string, input: CreatePostInput): Promise<Post> {
    const id = newId();
    await this.db.insert(posts).values({
      id,
      authorId,
      type: input.type,
      title: input.title.trim().slice(0, 160),
      body: input.body.trim().slice(0, 6000),
      tags: normaliseTags(input.tags),
      skills: normaliseSkills(input.skills),
      repoUrl: input.repoUrl?.trim() || null,
      repoName: input.repoName?.trim() || null,
      difficulty: input.type === 'opportunity' ? (input.difficulty ?? null) : null,
      projectId: input.projectId || null,
    });
    const created = await this.getPost(id, authorId);
    if (!created) throw new Error('post_create_failed');
    return created;
  }

  async deletePost(id: string, authorId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.authorId, authorId)))
      .returning({ id: posts.id });
    return deleted.length > 0;
  }

  async toggleVote(
    postId: string,
    userId: string,
  ): Promise<{ votes: number; voted: boolean } | null> {
    const [post] = await this.rows(sql`SELECT id FROM posts WHERE id = ${postId} LIMIT 1`);
    if (!post) return null;

    const [existing] = await this.rows(
      sql`SELECT 1 AS found FROM votes WHERE post_id = ${postId} AND user_id = ${userId} LIMIT 1`,
    );

    if (existing) {
      await this.db
        .delete(votes)
        .where(and(eq(votes.postId, postId), eq(votes.userId, userId)));
    } else {
      await this.db.insert(votes).values({ postId, userId }).onConflictDoNothing();
    }

    const [countRow] = await this.rows(
      sql`SELECT COUNT(*)::int AS count FROM votes WHERE post_id = ${postId}`,
    );
    return { votes: Number(countRow?.count ?? 0), voted: !existing };
  }

  // ------------------------------------------------------------- comments

  async listComments(postId: string, viewerId: string | null): Promise<Comment[]> {
    const rows = await this.rows(sql`
      SELECT
        c.id, c.post_id, c.body, c.created_at,
        u.id AS author_id, u.login AS author_login, u.name AS author_name,
        u.avatar_url AS author_avatar, u.is_demo AS author_is_demo
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `);

    return rows.map((row) => ({
      id: String(row.id),
      postId: String(row.post_id),
      body: String(row.body),
      author: this.authorFromRow(row, 'author'),
      createdAt: toIso(row.created_at),
      viewerIsAuthor: viewerId ? String(row.author_id) === viewerId : false,
    }));
  }

  async createComment(postId: string, authorId: string, body: string): Promise<Comment | null> {
    const [post] = await this.rows(sql`SELECT id FROM posts WHERE id = ${postId} LIMIT 1`);
    if (!post) return null;

    const id = newId();
    const [inserted] = await this.db
      .insert(comments)
      .values({ id, postId, authorId, body: body.trim().slice(0, 2000) })
      .returning();

    await this.db.update(posts).set({ updatedAt: new Date() }).where(eq(posts.id, postId));

    const [row] = await this.rows(sql`
      SELECT
        c.id, c.post_id, c.body, c.created_at,
        u.id AS author_id, u.login AS author_login, u.name AS author_name,
        u.avatar_url AS author_avatar, u.is_demo AS author_is_demo
      FROM comments c JOIN users u ON u.id = c.author_id
      WHERE c.id = ${String(inserted.id)}
      LIMIT 1
    `);

    return {
      id: String(row.id),
      postId: String(row.post_id),
      body: String(row.body),
      author: this.authorFromRow(row, 'author'),
      createdAt: toIso(row.created_at ?? new Date()),
      viewerIsAuthor: true,
    };
  }

  async deleteComment(id: string, authorId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.authorId, authorId)))
      .returning({ id: comments.id });
    return deleted.length > 0;
  }

  // ------------------------------------------------------------- projects

  async listProjects(): Promise<Project[]> {
    const rows = await this.rows(sql`
      ${PgStore.projectSelect}
      ORDER BY last_activity_at DESC
    `);
    return rows.map((row) => this.mapProject(row));
  }

  async getProject(slug: string): Promise<Project | null> {
    const [row] = await this.rows(sql`${PgStore.projectSelect} WHERE pr.slug = ${slug} LIMIT 1`);
    return row ? this.mapProject(row) : null;
  }

  async createProject(ownerId: string, input: ProjectInput): Promise<Project> {
    let slug = slugify(input.name);
    const [clash] = await this.rows(sql`SELECT 1 AS found FROM projects WHERE slug = ${slug} LIMIT 1`);
    if (clash) slug = `${slug}-${newId().slice(0, 4)}`;

    const [inserted] = await this.db
      .insert(projects)
      .values({
        id: newId(),
        slug,
        name: input.name.trim().slice(0, 80),
        description: input.description.trim().slice(0, 600),
        repoUrl: input.repoUrl?.trim() || null,
        tags: normaliseTags(input.tags),
        ownerId,
      })
      .returning();

    const project = await this.getProject(String(inserted.slug));
    if (!project) throw new Error('project_create_failed');
    return project;
  }

  // ----------------------------------------------------------------- meta

  async stats(): Promise<Stats> {
    const [row] = await this.rows(sql`
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_demo = false)::int AS contributors,
        (SELECT COUNT(*) FROM posts WHERE type = 'opportunity')::int AS opportunities,
        (SELECT COUNT(*) FROM posts WHERE type = 'idea')::int AS ideas,
        (SELECT COUNT(*) FROM posts WHERE type = 'discussion')::int AS discussions,
        (SELECT COUNT(*) FROM projects)::int AS projects,
        (SELECT COUNT(*) FROM comments)::int AS comments,
        (SELECT COUNT(*) FROM votes)::int AS votes
    `);
    return {
      contributors: Number(row?.contributors ?? 0),
      opportunities: Number(row?.opportunities ?? 0),
      ideas: Number(row?.ideas ?? 0),
      discussions: Number(row?.discussions ?? 0),
      projects: Number(row?.projects ?? 0),
      comments: Number(row?.comments ?? 0),
      votes: Number(row?.votes ?? 0),
    };
  }

  async listTags(): Promise<TagCount[]> {
    const rows = await this.rows(sql`
      SELECT tag, COUNT(*)::int AS count
      FROM (SELECT unnest(tags) AS tag FROM posts) AS t
      GROUP BY tag
      ORDER BY count DESC, tag ASC
      LIMIT 24
    `);
    return rows.map((row) => ({ tag: String(row.tag), count: Number(row.count) }));
  }

  async listContributors(limit = 8): Promise<PublicUser[]> {
    const rows = await this.rows(sql`
      SELECT login FROM users WHERE is_demo = false ORDER BY created_at ASC LIMIT ${limit}
    `);
    const people = await Promise.all(
      rows.map((row) => this.getPublicUser(String(row.login))),
    );
    return people.filter((person): person is PublicUser => person !== null);
  }
}
