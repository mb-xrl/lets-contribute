import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DIFFICULTIES, POST_TYPES, SORTS, type Difficulty, type PostType } from '@lets-contribute/shared';

export class ListPostsQueryDto {
  @IsOptional()
  @IsIn(['all', ...POST_TYPES])
  type?: PostType | 'all';

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  author?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  project?: string;

  @IsOptional()
  @IsIn(SORTS)
  sort?: 'newest' | 'top' | 'discussed';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

export class CreatePostDto {
  @IsIn(POST_TYPES)
  type!: PostType;

  @IsString()
  @Length(6, 160)
  title!: string;

  @IsString()
  @Length(10, 6000)
  body!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(32, { each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  repoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  repoName?: string;

  @IsOptional()
  @IsIn(DIFFICULTIES)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  projectSlug?: string;
}

export class CreateCommentDto {
  @IsString()
  @Length(1, 2000)
  body!: string;
}
