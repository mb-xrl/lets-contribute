import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Comment, Paginated, Post as PostModel } from '@lets-contribute/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/guards';
import type { StoredUser } from '../domain/store';
import { CreateCommentDto, CreatePostDto, ListPostsQueryDto } from './dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() user: StoredUser | null,
  ): Promise<Paginated<PostModel>> {
    return this.posts.list(query, user);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreatePostDto, @CurrentUser() user: StoredUser | null): Promise<PostModel> {
    return this.posts.create(user, dto);
  }

  @Get(':id')
  detail(@Param('id') id: string, @CurrentUser() user: StoredUser | null): Promise<PostModel> {
    return this.posts.detail(id, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: StoredUser | null) {
    return this.posts.remove(id, user);
  }

  @Post(':id/vote')
  @UseGuards(AuthGuard)
  vote(@Param('id') id: string, @CurrentUser() user: StoredUser | null) {
    return this.posts.vote(id, user);
  }

  @Get(':id/comments')
  comments(
    @Param('id') id: string,
    @CurrentUser() user: StoredUser | null,
  ): Promise<Comment[]> {
    return this.posts.comments(id, user);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: StoredUser | null,
  ): Promise<Comment> {
    return this.posts.addComment(id, user, dto);
  }
}

@Controller('comments')
export class CommentsController {
  constructor(private readonly posts: PostsService) {}

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: StoredUser | null) {
    return this.posts.removeComment(id, user);
  }
}
