import {
  Body,
  Controller,
  Get,
  Inject,
  Injectable,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import type { Project } from '@lets-contribute/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/guards';
import { STORE, type Store, type StoredUser } from '../domain/store';

export class CreateProjectDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsString()
  @Length(10, 600)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  repoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(32, { each: true })
  tags?: string[];
}

@Injectable()
export class ProjectsService {
  constructor(@Inject(STORE) private readonly store: Store) {}

  list(): Promise<Project[]> {
    return this.store.listProjects(null);
  }

  async detail(slug: string): Promise<Project> {
    const project = await this.store.getProject(slug);
    if (!project) throw new NotFoundException('That project does not exist yet.');
    return project;
  }

  async create(user: StoredUser | null, dto: CreateProjectDto): Promise<Project> {
    if (!user) throw new UnauthorizedException('Sign in with GitHub to add a project.');
    return this.store.createProject(user.id, {
      name: dto.name,
      description: dto.description,
      repoUrl: dto.repoUrl ?? null,
      tags: dto.tags,
    });
  }
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(): Promise<Project[]> {
    return this.projects.list();
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: StoredUser | null): Promise<Project> {
    return this.projects.create(user, dto);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string): Promise<Project> {
    return this.projects.detail(slug);
  }
}
