import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Comment, Paginated, Post } from '@lets-contribute/shared';
import { STORE, type Store, type StoredUser } from '../domain/store';
import type { CreateCommentDto, CreatePostDto, ListPostsQueryDto } from './dto';

@Injectable()
export class PostsService {
  constructor(@Inject(STORE) private readonly store: Store) {}

  private requireUser(user: StoredUser | null): StoredUser {
    if (!user) throw new UnauthorizedException('Sign in with GitHub to do that.');
    return user;
  }

  list(query: ListPostsQueryDto, viewer: StoredUser | null): Promise<Paginated<Post>> {
    return this.store.listPosts(
      {
        type: query.type ?? 'all',
        tag: query.tag,
        q: query.q,
        author: query.author,
        project: query.project,
        sort: query.sort ?? 'newest',
        page: query.page,
        pageSize: query.pageSize,
      },
      viewer?.id ?? null,
    );
  }

  async detail(id: string, viewer: StoredUser | null): Promise<Post> {
    const post = await this.store.getPost(id, viewer?.id ?? null);
    if (!post) throw new NotFoundException('That post no longer exists.');
    return post;
  }

  async create(user: StoredUser | null, dto: CreatePostDto): Promise<Post> {
    const author = this.requireUser(user);

    let projectId: string | null = null;
    if (dto.projectSlug) {
      const project = await this.store.getProject(dto.projectSlug);
      if (!project) throw new NotFoundException('That project does not exist.');
      projectId = project.id;
    }

    return this.store.createPost(author.id, {
      type: dto.type,
      title: dto.title,
      body: dto.body,
      tags: dto.tags,
      skills: dto.skills,
      repoUrl: dto.repoUrl ?? null,
      repoName: dto.repoName ?? null,
      difficulty: dto.type === 'opportunity' ? (dto.difficulty ?? null) : null,
      projectId,
    });
  }

  async remove(id: string, user: StoredUser | null): Promise<{ ok: true }> {
    const viewer = this.requireUser(user);
    const post = await this.store.getPost(id, viewer.id);
    if (!post) throw new NotFoundException('That post no longer exists.');
    if (!post.viewerIsAuthor) throw new ForbiddenException('Only the author can delete this post.');
    await this.store.deletePost(id, viewer.id);
    return { ok: true };
  }

  async vote(id: string, user: StoredUser | null): Promise<{ votes: number; voted: boolean }> {
    const viewer = this.requireUser(user);
    const result = await this.store.toggleVote(id, viewer.id);
    if (!result) throw new NotFoundException('That post no longer exists.');
    return result;
  }

  async comments(id: string, viewer: StoredUser | null): Promise<Comment[]> {
    const post = await this.store.getPost(id, viewer?.id ?? null);
    if (!post) throw new NotFoundException('That post no longer exists.');
    return this.store.listComments(id, viewer?.id ?? null);
  }

  async addComment(
    id: string,
    user: StoredUser | null,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const author = this.requireUser(user);
    const comment = await this.store.createComment(id, author.id, dto.body);
    if (!comment) throw new NotFoundException('That post no longer exists.');
    return comment;
  }

  async removeComment(commentId: string, user: StoredUser | null): Promise<{ ok: true }> {
    const viewer = this.requireUser(user);
    const deleted = await this.store.deleteComment(commentId, viewer.id);
    if (!deleted) throw new ForbiddenException('You can only delete your own comments.');
    return { ok: true };
  }
}
