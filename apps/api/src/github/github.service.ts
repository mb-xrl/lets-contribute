import {
  BadGatewayException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { RepoPreview } from '@lets-contribute/shared';
import { config } from '../config';
import type { GitHubProfile } from '../domain/store';

type GitHubUserResponse = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  html_url: string;
};

type GitHubRepoResponse = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  open_issues_count: number;
  html_url: string;
  topics?: string[];
  license: { spdx_id?: string | null; name?: string } | null;
};

@Injectable()
export class GitHubService {
  private readonly logger = new Logger('GitHub');

  private headers(useUserToken?: string): Record<string, string> {
    const token = useUserToken || config.github.token;
    return {
      accept: 'application/vnd.github+json',
      'user-agent': 'lets-contribute',
      'x-github-api-version': '2022-11-28',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };
  }

  authorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.callbackUrl,
      scope: 'read:user user:email',
      state,
      allow_signup: 'true',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.callbackUrl,
      }),
    });

    if (!response.ok) {
      this.logger.error(`token exchange failed with ${response.status}`);
      throw new BadGatewayException('GitHub rejected the sign-in attempt.');
    }

    const data = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!data.access_token) {
      throw new UnauthorizedException(
        data.error_description || 'GitHub did not return an access token.',
      );
    }
    return data.access_token;
  }

  async fetchProfile(accessToken: string): Promise<GitHubProfile> {
    const response = await fetch('https://api.github.com/user', {
      headers: this.headers(accessToken),
    });

    if (!response.ok) {
      throw new BadGatewayException('Could not load your GitHub profile.');
    }

    const profile = (await response.json()) as GitHubUserResponse;
    return {
      id: String(profile.id),
      login: profile.login,
      name: profile.name ?? profile.login,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      htmlUrl: profile.html_url,
    };
  }

  parseRepoInput(input: string): { owner: string; repo: string } | null {
    const trimmed = input.trim().replace(/\.git$/, '').replace(/\/$/, '');
    const fromUrl = trimmed.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/i);
    if (fromUrl) return { owner: fromUrl[1], repo: fromUrl[2] };
    const bare = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
    if (bare) return { owner: bare[1], repo: bare[2] };
    return null;
  }

  /** Public repo metadata used by the composer's "import from GitHub" preview. */
  async repoPreview(input: string): Promise<RepoPreview | null> {
    const parsed = this.parseRepoInput(input);
    if (!parsed) return null;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
        { headers: this.headers() },
      );
      if (!response.ok) return null;
      const repo = (await response.json()) as GitHubRepoResponse;

      let goodFirstIssues = 0;
      try {
        const search = await fetch(
          `https://api.github.com/search/issues?per_page=1&q=${encodeURIComponent(
            `repo:${repo.full_name} label:"good first issue" state:open`,
          )}`,
          { headers: this.headers() },
        );
        if (search.ok) {
          const body = (await search.json()) as { total_count?: number };
          goodFirstIssues = body.total_count ?? 0;
        }
      } catch {
        goodFirstIssues = 0;
      }

      return {
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        openIssues: repo.open_issues_count,
        goodFirstIssues,
        url: repo.html_url,
        topics: repo.topics ?? [],
        license: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION'
          ? repo.license.spdx_id
          : (repo.license?.name ?? null),
      };
    } catch (error) {
      this.logger.warn(`repo preview failed for ${input}: ${String(error)}`);
      return null;
    }
  }
}
