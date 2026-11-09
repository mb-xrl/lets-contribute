import { Injectable, Logger } from '@nestjs/common';
import {
  PAGE_SIZE,
  type Author,
  type Comment,
  type Paginated,
  type Post,
  type PostQuery,
  type Project,
  type ProjectInput,
  type PublicUser,
  type Stats,
  type TagCount,
} from '@lets-contribute/shared';
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

/**
 * In-memory implementation used for local development and Vercel previews
 * without a DATABASE_URL. Same contract as the Neon implementation; data
 * resets on cold start.
 */
@Injectable()
export class MemoryStore implements Store {
  readonly kind = 'memory' as const;
  private readonly logger = new Logger('MemoryStore');
  private users = new Map<string, StoredUser>();
  private projects = new Map<string, StoredProject>();
  private posts = new Map<string, StoredPost>();
  private comments = new Map<string, StoredComment>();
  private votes = new Map<string, Set<string>>();
  private ready = true;
  private detail = 'seeded in-memory store';

  async migrate(): Promise<void> {
    // Nothing to do: the in-memory store creates its own structures.
  }

  status() {
    return { kind: this.kind, ready: this.ready, detail: this.detail };
  }

  private author(id: string): Author {
    const user = this.users.get(id);
    return {
      id,
      login: user?.login ?? 'unknown',
      name: user?.name ?? 'Unknown',
      avatarUrl: user?.avatarUrl ?? null,
      isDemo: user?.isDemo ?? false,
    };
  }

  private toPost(post: StoredPost, viewerId: string | null): Post {
    const project = post.projectId ? this.projects.get(post.projectId) : null;
    const voters = this.votes.get(post.id) ?? new Set<string>();
    const commentCount = Array.from(this.comments.values()).filter(
      (comment) => comment.postId === post.id,
    ).length;

    return {
      id: post.id,
      type: post.type,
      title: post.title,
      body: post.body,
      tags: post.tags,
      skills: post.skills,
      repoUrl: post.repoUrl,
      repoName: post.repoName,
      difficulty: post.difficulty,
      project: project ? { id: project.id, slug: project.slug, name: project.name } : null,
      author: this.author(post.authorId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      votes: voters.size,
      commentCount,
      viewerVoted: viewerId ? voters.has(viewerId) : false,
      viewerIsAuthor: viewerId === post.authorId,
    };
  }

  private toComment(comment: StoredComment, viewerId: string | null): Comment {
    return {
      id: comment.id,
      postId: comment.postId,
      body: comment.body,
      author: this.author(comment.authorId),
      createdAt: comment.createdAt,
      viewerIsAuthor: viewerId === comment.authorId,
    };
  }

  private toProject(project: StoredProject): Project {
    const discussions = Array.from(this.posts.values()).filter(
      (post) => post.projectId === project.id,
    );
    const discussionIds = new Set(discussions.map((post) => post.id));
    const commentCount = Array.from(this.comments.values()).filter((comment) =>
      discussionIds.has(comment.postId),
    ).length;
    const lastActivity = discussions
      .map((post) => post.updatedAt)
      .sort()
      .at(-1);

    return {
      id: project.id,
      slug: project.slug,
      name: project.name,
      description: project.description,
      repoUrl: project.repoUrl,
      tags: project.tags,
      owner: this.author(project.ownerId),
      createdAt: project.createdAt,
      discussionCount: discussions.length,
      commentCount,
      lastActivityAt: lastActivity ?? project.createdAt,
    };
  }

  private publicUser(user: StoredUser): PublicUser {
    const authored = Array.from(this.posts.values()).filter((post) => post.authorId === user.id);
    const authoredIds = new Set(authored.map((post) => post.id));
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
        posts: authored.length,
        ideas: authored.filter((post) => post.type === 'idea').length,
        discussions: authored.filter((post) => post.type === 'discussion').length,
        comments: Array.from(this.comments.values()).filter((comment) => comment.authorId === user.id)
          .length,
        votesReceived: authoredIds.size
          ? Array.from(authoredIds).reduce((sum, id) => sum + (this.votes.get(id)?.size ?? 0), 0)
          : 0,
      },
    };
  }

  async seedIfEmpty(): Promise<{ seeded: boolean }> {
    if (this.users.size > 0) return { seeded: false };

    for (const user of [...seed.users, seed.demoUser]) {
      this.users.set(user.id, { ...user, githubId: null });
    }
    for (const project of seed.projects) {
      this.projects.set(project.id, { ...project });
    }
    for (const post of seed.posts) {
      const { voters, ...rest } = post;
      this.posts.set(post.id, { ...rest });
      this.votes.set(post.id, new Set(voters));
    }
    for (const comment of seed.comments) {
      this.comments.set(comment.id, { ...comment });
    }

    this.detail = `${this.posts.size} posts · ${this.projects.size} projects · ${this.users.size} members (in-memory)`;
    this.logger.log(
      `Seeded ${this.users.size} members, ${this.posts.size} posts, ${this.projects.size} projects`,
    );
    return { seeded: true };
  }

  // ---------------------------------------------------------------- users

  async upsertGitHubUser(profile: GitHubProfile): Promise<StoredUser> {
    const existing = Array.from(this.users.values()).find(
      (user) => user.githubId === profile.id || user.login === profile.login,
    );

    if (existing) {
      const updated: StoredUser = {
        ...existing,
        githubId: profile.id,
        login: profile.login,
        name: profile.name || existing.name,
        avatarUrl: profile.avatarUrl ?? existing.avatarUrl,
        bio: existing.bio ?? profile.bio,
        location: existing.location ?? profile.location,
        githubUrl: profile.htmlUrl,
        isDemo: false,
      };
      this.users.set(updated.id, updated);
      return updated;
    }

    const user: StoredUser = {
      id: newId(),
      githubId: profile.id,
      login: profile.login,
      name: profile.name || profile.login,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      location: profile.location,
      githubUrl: profile.htmlUrl,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async createDemoUser(): Promise<StoredUser> {
    const existing = this.users.get(seed.demoUser.id);
    if (existing) return existing;
    const user: StoredUser = { ...seed.demoUser, githubId: null };
    this.users.set(user.id, user);
    return user;
  }

  async findUserById(id: string): Promise<StoredUser | null> {
    return this.users.get(id) ?? null;
  }

  async findUserByLogin(login: string): Promise<StoredUser | null> {
    const needle = login.toLowerCase();
    return (
      Array.from(this.users.values()).find((user) => user.login.toLowerCase() === needle) ?? null
    );
  }

  async updateProfile(
    id: string,
    patch: { bio?: string; location?: string },
  ): Promise<StoredUser> {
    const user = this.users.get(id);
    if (!user) throw new Error('user_not_found');
    const updated: StoredUser = {
      ...user,
      bio: patch.bio !== undefined ? patch.bio.slice(0, 280) : user.bio,
      location: patch.location !== undefined ? patch.location.slice(0, 80) : user.location,
    };
    this.users.set(id, updated);
    return updated;
  }

  async getPublicUser(login: string): Promise<PublicUser | null> {
    const user = await this.findUserByLogin(login);
    return user ? this.publicUser(user) : null;
  }

  // ---------------------------------------------------------------- posts

  async listPosts(query: PostQuery, viewerId: string | null): Promise<Paginated<Post>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || PAGE_SIZE));
    const search = (query.q ?? '').trim().toLowerCase();

    let items = Array.from(this.posts.values()).filter((post) => {
      if (query.type && query.type !== 'all' && post.type !== query.type) return false;
      if (query.tag && !post.tags.includes(query.tag.toLowerCase())) return false;
      if (query.project) {
        const project = post.projectId ? this.projects.get(post.projectId) : null;
        if (!project || project.slug !== query.project) return false;
      }
      if (query.author) {
        const author = this.users.get(post.authorId);
        if (!author || author.login.toLowerCase() !== query.author.toLowerCase()) return false;
      }
      if (search) {
        const haystack = `${post.title} ${post.body} ${post.tags.join(' ')} ${post.skills.join(' ')}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const voteCount = (post: StoredPost) => this.votes.get(post.id)?.size ?? 0;
    const commentCount = (postId: string) =>
      Array.from(this.comments.values()).filter((comment) => comment.postId === postId).length;

    const sort = query.sort ?? 'newest';
    items = items.sort((a, b) => {
      if (sort === 'top') {
        return voteCount(b) - voteCount(a) || b.createdAt.localeCompare(a.createdAt);
      }
      if (sort === 'discussed') {
        return (
          commentCount(b.id) - commentCount(a.id) || b.createdAt.localeCompare(a.createdAt)
        );
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    const total = items.length;
    const slice = items.slice((page - 1) * pageSize, page * pageSize);
    return {
      items: slice.map((post) => this.toPost(post, viewerId)),
      total,
      page,
      pageSize,
    };
  }

  async getPost(id: string, viewerId: string | null): Promise<Post | null> {
    const post = this.posts.get(id);
    return post ? this.toPost(post, viewerId) : null;
  }

  async createPost(authorId: string, input: CreatePostInput): Promise<Post> {
    if (!this.users.has(authorId)) throw new Error('user_not_found');
    const now = new Date().toISOString();
    const post: StoredPost = {
      id: newId(),
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
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(post.id, post);
    return this.toPost(post, authorId);
  }

  async deletePost(id: string, authorId: string): Promise<boolean> {
    const post = this.posts.get(id);
    if (!post || post.authorId !== authorId) return false;
    this.posts.delete(id);
    this.votes.delete(id);
    for (const [commentId, comment] of this.comments) {
      if (comment.postId === id) this.comments.delete(commentId);
    }
    return true;
  }

  async toggleVote(
    postId: string,
    userId: string,
  ): Promise<{ votes: number; voted: boolean } | null> {
    if (!this.posts.has(postId)) return null;
    const voters = this.votes.get(postId) ?? new Set<string>();
    const voted = !voters.has(userId);
    if (voted) voters.add(userId);
    else voters.delete(userId);
    this.votes.set(postId, voters);
    return { votes: voters.size, voted };
  }

  // ------------------------------------------------------------- comments

  async listComments(postId: string, viewerId: string | null): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((comment) => this.toComment(comment, viewerId));
  }

  async createComment(
    postId: string,
    authorId: string,
    body: string,
  ): Promise<Comment | null> {
    if (!this.posts.has(postId) || !this.users.has(authorId)) return null;
    const comment: StoredComment = {
      id: newId(),
      postId,
      authorId,
      body: body.trim().slice(0, 2000),
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    const post = this.posts.get(postId);
    if (post) this.posts.set(postId, { ...post, updatedAt: comment.createdAt });
    return this.toComment(comment, authorId);
  }

  async deleteComment(id: string, authorId: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment || comment.authorId !== authorId) return false;
    this.comments.delete(id);
    return true;
  }

  // ------------------------------------------------------------- projects

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((project) => this.toProject(project));
  }

  async getProject(slug: string): Promise<Project | null> {
    const project = Array.from(this.projects.values()).find((item) => item.slug === slug);
    return project ? this.toProject(project) : null;
  }

  async createProject(ownerId: string, input: ProjectInput): Promise<Project> {
    let slug = slugify(input.name);
    if (Array.from(this.projects.values()).some((project) => project.slug === slug)) {
      slug = `${slug}-${newId().slice(0, 4)}`;
    }
    const project: StoredProject = {
      id: newId(),
      slug,
      name: input.name.trim().slice(0, 80),
      description: input.description.trim().slice(0, 600),
      repoUrl: input.repoUrl?.trim() || null,
      tags: normaliseTags(input.tags),
      ownerId,
      createdAt: new Date().toISOString(),
    };
    this.projects.set(project.id, project);
    return this.toProject(project);
  }

  // ----------------------------------------------------------------- meta

  async stats(): Promise<Stats> {
    const posts = Array.from(this.posts.values());
    return {
      contributors: Array.from(this.users.values()).filter((user) => !user.isDemo).length,
      opportunities: posts.filter((post) => post.type === 'opportunity').length,
      ideas: posts.filter((post) => post.type === 'idea').length,
      discussions: posts.filter((post) => post.type === 'discussion').length,
      projects: this.projects.size,
      comments: this.comments.size,
      votes: Array.from(this.votes.values()).reduce((sum, voters) => sum + voters.size, 0),
    };
  }

  async listTags(): Promise<TagCount[]> {
    const counts = new Map<string, number>();
    for (const post of this.posts.values()) {
      for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, 24);
  }

  async listContributors(limit = 8): Promise<PublicUser[]> {
    return Array.from(this.users.values())
      .filter((user) => !user.isDemo)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit)
      .map((user) => this.publicUser(user));
  }
}
