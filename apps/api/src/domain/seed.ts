import type { Difficulty, PostType } from '@lets-contribute/shared';
import { daysAgo, hoursAgo } from './ids';

/**
 * Demo content. Used verbatim by the in-memory store and by `npm run db:setup`
 * to seed a fresh Neon database, so the empty-state never looks empty.
 * Timestamps are computed relative to "now" so the feed always feels alive.
 */

export type SeedUser = {
  id: string;
  login: string;
  name: string;
  bio: string;
  location: string;
  avatarUrl: string | null;
  githubUrl: string;
  isDemo: boolean;
  createdAt: string;
};

export type SeedProject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  repoUrl: string;
  tags: string[];
  ownerId: string;
  createdAt: string;
};

export type SeedPost = {
  id: string;
  authorId: string;
  type: PostType;
  title: string;
  body: string;
  tags: string[];
  skills: string[];
  repoUrl: string | null;
  repoName: string | null;
  difficulty: Difficulty | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  voters: string[];
};

export type SeedComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
};

const users: SeedUser[] = [
  {
    id: 'usr_lina',
    login: 'lina-bouzid',
    name: 'Lina Bouzid',
    bio: 'Frontend engineer. Design systems, motion, accessibility. React + Tailwind, mostly.',
    location: 'Tunis, Tunisia',
    avatarUrl: null,
    githubUrl: 'https://github.com/lina-bouzid',
    isDemo: false,
    createdAt: daysAgo(410),
  },
  {
    id: 'usr_yusuf',
    login: 'yusuf-okafor',
    name: 'Yusuf Okafor',
    bio: 'Platform engineer. Postgres, queues, and more YAML than I would like.',
    location: 'Lagos, Nigeria',
    avatarUrl: null,
    githubUrl: 'https://github.com/yusuf-okafor',
    isDemo: false,
    createdAt: daysAgo(395),
  },
  {
    id: 'usr_maya',
    login: 'maya-reyes',
    name: 'Maya Reyes',
    bio: 'Developer experience and docs. I turn confusing onboarding into a 10-minute setup.',
    location: 'Mexico City',
    avatarUrl: null,
    githubUrl: 'https://github.com/maya-reyes',
    isDemo: false,
    createdAt: daysAgo(370),
  },
  {
    id: 'usr_tomas',
    login: 'tomas-lindqvist',
    name: 'Tomas Lindqvist',
    bio: 'Rust, WASM and audio. Maintainer of Sonic Loom.',
    location: 'Stockholm',
    avatarUrl: null,
    githubUrl: 'https://github.com/tomas-lindqvist',
    isDemo: false,
    createdAt: daysAgo(340),
  },
  {
    id: 'usr_amara',
    login: 'amara-diallo',
    name: 'Amara Diallo',
    bio: 'Civic tech. Maps, open data, public transport.',
    location: 'Dakar, Senegal',
    avatarUrl: null,
    githubUrl: 'https://github.com/amara-diallo',
    isDemo: false,
    createdAt: daysAgo(300),
  },
  {
    id: 'usr_kenji',
    login: 'kenji-watanabe',
    name: 'Kenji Watanabe',
    bio: 'TypeScript tooling, ASTs and codemods. Maintainer of Patchwork.',
    location: 'Kyoto',
    avatarUrl: null,
    githubUrl: 'https://github.com/kenji-watanabe',
    isDemo: false,
    createdAt: daysAgo(280),
  },
  {
    id: 'usr_sofia',
    login: 'sofia-marchetti',
    name: 'Sofia Marchetti',
    bio: 'Backend and data. Postgres nerd, offline-first apologist.',
    location: 'Milan',
    avatarUrl: null,
    githubUrl: 'https://github.com/sofia-marchetti',
    isDemo: false,
    createdAt: daysAgo(260),
  },
  {
    id: 'usr_noor',
    login: 'noor-haddad',
    name: 'Noor Haddad',
    bio: 'Product designer learning to code (and to write PRs people enjoy reviewing).',
    location: 'Amman',
    avatarUrl: null,
    githubUrl: 'https://github.com/noor-haddad',
    isDemo: false,
    createdAt: daysAgo(180),
  },
  {
    id: 'usr_diego',
    login: 'diego-ferreira',
    name: 'Diego Ferreira',
    bio: 'Mobile and React Native. First-time OSS maintainer.',
    location: 'São Paulo',
    avatarUrl: null,
    githubUrl: 'https://github.com/diego-ferreira',
    isDemo: false,
    createdAt: daysAgo(150),
  },
  {
    id: 'usr_elena',
    login: 'elena-petrova',
    name: 'Elena Petrova',
    bio: 'Security. Threat models, dependency audits, supply chain hygiene.',
    location: 'Belgrade',
    avatarUrl: null,
    githubUrl: 'https://github.com/elena-petrova',
    isDemo: false,
    createdAt: daysAgo(120),
  },
  {
    id: 'usr_priya',
    login: 'priya-raman',
    name: 'Priya Raman',
    bio: 'SRE. Observability, OpenTelemetry, and incident write-ups nobody reads.',
    location: 'Bengaluru',
    avatarUrl: null,
    githubUrl: 'https://github.com/priya-raman',
    isDemo: false,
    createdAt: daysAgo(96),
  },
  {
    id: 'usr_samuel',
    login: 'samuel-adeyemi',
    name: 'Samuel Adeyemi',
    bio: 'Data engineer. dbt, DuckDB, and spreadsheets that should have been databases.',
    location: 'Accra',
    avatarUrl: null,
    githubUrl: 'https://github.com/samuel-adeyemi',
    isDemo: false,
    createdAt: daysAgo(64),
  },
];

const projects: SeedProject[] = [
  {
    id: 'prj_orbit',
    slug: 'orbit-ui',
    name: 'Orbit UI',
    description:
      'Accessible, unstyled-first React primitives with an optional glass layer. Motion-safe, keyboard-complete, WCAG 2.2 AA.',
    repoUrl: 'https://github.com/lets-contribute/orbit-ui',
    tags: ['react', 'design-system', 'accessibility', 'typescript'],
    ownerId: 'usr_lina',
    createdAt: daysAgo(320),
  },
  {
    id: 'prj_neonnotes',
    slug: 'neon-notes',
    name: 'Neon Notes',
    description:
      'Offline-first markdown notes. Postgres is the source of truth, IndexedDB is the buffer, CRDT merges on reconnect.',
    repoUrl: 'https://github.com/lets-contribute/neon-notes',
    tags: ['nextjs', 'postgres', 'offline-first', 'typescript'],
    ownerId: 'usr_sofia',
    createdAt: daysAgo(240),
  },
  {
    id: 'prj_patchwork',
    slug: 'patchwork',
    name: 'Patchwork',
    description:
      'An issue triage bot: labels incoming issues, surfaces good-first-issues, and routes work to the right maintainer.',
    repoUrl: 'https://github.com/lets-contribute/patchwork',
    tags: ['github-actions', 'typescript', 'maintainer-tools'],
    ownerId: 'usr_kenji',
    createdAt: daysAgo(200),
  },
  {
    id: 'prj_trails',
    slug: 'tunis-trails',
    name: 'Tunis Trails',
    description:
      'An open civic map of walking trails, stairways and shortcuts across Tunis. OSM data in, usable routes out.',
    repoUrl: 'https://github.com/lets-contribute/tunis-trails',
    tags: ['open-data', 'maps', 'civic-tech', 'python'],
    ownerId: 'usr_amara',
    createdAt: daysAgo(140),
  },
  {
    id: 'prj_loom',
    slug: 'sonic-loom',
    name: 'Sonic Loom',
    description:
      'A browser-native audio editor built on the Web Audio API. Waveforms, effect chains, zero installs.',
    repoUrl: 'https://github.com/lets-contribute/sonic-loom',
    tags: ['web-audio', 'wasm', 'rust', 'canvas'],
    ownerId: 'usr_tomas',
    createdAt: daysAgo(120),
  },
];

const posts: SeedPost[] = [
  {
    id: 'pst_combobox',
    authorId: 'usr_lina',
    type: 'opportunity',
    title: 'Add keyboard navigation to the Orbit Combobox primitive',
    body: `Orbit's Combobox works beautifully with a mouse and is a disaster with a keyboard. We need ArrowUp/ArrowDown to move the active option, Home/End to jump, Enter to select and Escape to restore the previous value — plus focus trapping while the listbox is open.\n\n## Why it matters\n\nThree downstream apps cannot ship their forms until this is done. The behaviour spec is written and reviewed; the work is mostly wiring.\n\n## What you'll touch\n\n- \`packages/primitives/combobox\` — the state machine lives in \`useCombobox\`\n- \`aria-activedescendant\` management (we already generate ids)\n- Tests: we use Vitest + Testing Library, and there is a keyboard test scaffold waiting for you\n\nPairing available any weekday evening CET. If you have never opened a PR before, tell us in a comment — we will walk you through the first one step by step.`,
    tags: ['good-first-issue', 'accessibility', 'react'],
    skills: ['TypeScript', 'React', 'ARIA'],
    repoUrl: 'https://github.com/lets-contribute/orbit-ui/issues/148',
    repoName: 'lets-contribute/orbit-ui',
    difficulty: 'beginner',
    projectId: 'prj_orbit',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    voters: ['usr_yusuf', 'usr_maya', 'usr_noor', 'usr_kenji', 'usr_priya', 'usr_diego'],
  },
  {
    id: 'pst_conflict',
    authorId: 'usr_sofia',
    type: 'opportunity',
    title: 'Build a merge-conflict visualiser for CRDT documents',
    body: `When two devices edit the same note offline, we merge with Yjs and silently pick a winner. Users deserve better: we want a side-by-side view that highlights concurrent edits and lets a human choose.\n\n## Scope\n\n- A diff surface for two \`Y.Text\` snapshots (we already persist snapshots on every sync)\n- Keep/discard controls per hunk\n- A small "who changed this" byline using the update's client id\n\n## Where to start\n\nRead \`docs/crdt-merge.md\` first, then \`apps/web/src/sync\`. The UI is Next.js + Tailwind; the merge layer is framework-free. Good intermediate task — expect ~2 weeks of evenings.`,
    tags: ['help-wanted', 'nextjs', 'postgres'],
    skills: ['TypeScript', 'CRDT', 'Next.js'],
    repoUrl: 'https://github.com/lets-contribute/neon-notes/issues/92',
    repoName: 'lets-contribute/neon-notes',
    difficulty: 'intermediate',
    projectId: 'prj_neonnotes',
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(9),
    voters: ['usr_yusuf', 'usr_lina', 'usr_samuel', 'usr_tomas', 'usr_priya'],
  },
  {
    id: 'pst_ruleengine',
    authorId: 'usr_kenji',
    type: 'opportunity',
    title: 'Port the triage rule engine to Rust + WASM',
    body: `Patchwork scores every incoming issue against maintainer-written rules ("if the body mentions 'flutter', label mobile"). Today it is a 1,400-line TypeScript if-else nest and it is slow on repos with 50k issues.\n\nWe want a small Rust crate compiled to WASM, exposing \`score(issue, rules) -> Score[]\`, with the same rule DSL. There is a benchmark harness in \`bench/\` and a golden-file test suite you can use as the spec.\n\nAdvanced task: you should be comfortable with \`wasm-bindgen\`, and either Rust or a strong willingness to learn it. Kenji is available for architecture review in the first week.`,
    tags: ['advanced', 'rust', 'performance'],
    skills: ['Rust', 'WebAssembly', 'TypeScript'],
    repoUrl: 'https://github.com/lets-contribute/patchwork/issues/210',
    repoName: 'lets-contribute/patchwork',
    difficulty: 'advanced',
    projectId: 'prj_patchwork',
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(20),
    voters: ['usr_sofia', 'usr_tomas', 'usr_yusuf'],
  },
  {
    id: 'pst_osm',
    authorId: 'usr_amara',
    type: 'opportunity',
    title: 'Import OpenStreetMap footpaths for the Medina of Tunis',
    body: `Tunis Trails currently covers 12 km of routes, all hand-traced. The Medina has hundreds of pedestrian ways in OSM that we have never imported, including 47 public stairways.\n\n## The task\n\n- Write an import script (\`scripts/import_osm.py\`) that pulls \`highway=footway|steps|pedestrian\` inside the Medina bounding box via the Overpass API\n- Normalise stair counts with \`step_count\` when present, infer them from geometry when not\n- Respect ODbL attribution — every imported way keeps its OSM id\n\nPython + geopandas, no prior GIS experience required. Amara will review within 48h.`,
    tags: ['good-first-issue', 'open-data', 'python'],
    skills: ['Python', 'OpenStreetMap', 'GIS'],
    repoUrl: 'https://github.com/lets-contribute/tunis-trails/issues/34',
    repoName: 'lets-contribute/tunis-trails',
    difficulty: 'beginner',
    projectId: 'prj_trails',
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(30),
    voters: ['usr_noor', 'usr_lina', 'usr_samuel', 'usr_diego', 'usr_maya'],
  },
  {
    id: 'pst_spectrogram',
    authorId: 'usr_tomas',
    type: 'opportunity',
    title: 'Ship a WebGL2 spectrogram renderer for the timeline',
    body: `Sonic Loom draws waveforms with Canvas2D at 60fps for 10-second clips and drops to 8fps at 10 minutes. We want the analyser view on WebGL2: a single instanced draw call, an FFT texture updated from the Web Audio \`AnalyserNode\`, and a colour ramp that stays readable in both themes.\n\nFallback to the existing Canvas2D path when WebGL2 is unavailable (older Safari, some Linux VMs). The renderer interface is already abstracted in \`src/render/backends\`.\n\nAdvanced: GLSL and audio DSP experience expected.`,
    tags: ['advanced', 'webgl', 'audio'],
    skills: ['WebGL2', 'GLSL', 'Audio DSP'],
    repoUrl: 'https://github.com/lets-contribute/sonic-loom/issues/77',
    repoName: 'lets-contribute/sonic-loom',
    difficulty: 'advanced',
    projectId: 'prj_loom',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    voters: ['usr_kenji', 'usr_priya'],
  },
  {
    id: 'pst_docs',
    authorId: 'usr_maya',
    type: 'opportunity',
    title: 'Document the self-hosting path on Neon branches',
    body: `Neon Notes can be self-hosted on two Neon branches (staging + production). The current docs assume you already know what a branch is, which is exactly the problem.\n\nWe need a single page that takes someone from "I have a Neon account" to "notes sync between my laptop and phone", including the one env var that trips everyone up (\`DATABASE_URL\` must use the pooled endpoint).

Writing task — no code required, but you will need to actually run the setup so the steps are real. We pay in review speed and gratitude.`,
    tags: ['good-first-issue', 'documentation'],
    skills: ['Technical writing', 'Neon', 'Postgres'],
    repoUrl: 'https://github.com/lets-contribute/neon-notes/issues/101',
    repoName: 'lets-contribute/neon-notes',
    difficulty: 'beginner',
    projectId: 'prj_neonnotes',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    voters: ['usr_lina', 'usr_noor', 'usr_samuel', 'usr_elena'],
  },
  {
    id: 'pst_pairing',
    authorId: 'usr_noor',
    type: 'idea',
    title: 'Weekly "first PR" pairing rooms',
    body: `Most people who say "I'd love to contribute but I don't know where to start" need three things: a small issue, a person to unblock them for 30 minutes, and permission to be slow.\n\nProposal: every Thursday, two 45-minute rooms (one CET-friendly, one PT-friendly) where maintainers pair live with first-timers on a single \`good-first-issue\`. No recordings, no expectations, and you leave with a branch instead of a browser tab graveyard.\n\nWho would host one? We need six maintainers to cover a month. Reply with your timezone and the repo you would bring.`,
    tags: ['community', 'mentorship'],
    skills: [],
    repoUrl: null,
    repoName: null,
    difficulty: null,
    projectId: null,
    createdAt: hoursAgo(14),
    updatedAt: hoursAgo(14),
    voters: ['usr_lina', 'usr_maya', 'usr_amara', 'usr_diego', 'usr_priya', 'usr_samuel', 'usr_elena'],
  },
  {
    id: 'pst_passport',
    authorId: 'usr_yusuf',
    type: 'idea',
    title: 'Contribution passports: a portable record of what you actually shipped',
    body: `GitHub shows green squares. It does not show that you wrote the migration that unblocked a release, or that you reviewed 40 PRs for a project nobody thanks you for.\n\nIdea: a public profile page that assembles your real record from GitHub events — merged PRs with their diff size, reviews given, issues triaged — and lets you write one sentence of context per entry. Exportable as JSON so you can paste it into a job application.\n\nOpen questions: how do we avoid turning this into a leaderboard? Should review count be weighted more than lines changed? I lean yes, strongly.`,
    tags: ['community', 'portfolio', 'github'],
    skills: [],
    repoUrl: null,
    repoName: null,
    difficulty: null,
    projectId: null,
    createdAt: hoursAgo(26),
    updatedAt: hoursAgo(26),
    voters: ['usr_kenji', 'usr_maya', 'usr_noor', 'usr_elena'],
  },
  {
    id: 'pst_labeltrans',
    authorId: 'usr_priya',
    type: 'discussion',
    title: 'What does `good-first-issue` actually mean in your repo?',
    body: `In practice it means wildly different things: "you can do this in one evening" in one repo, "you need to understand our 80k-line monorepo" in another.\n\nBefore we start labelling things here, let us agree on a small rubric: estimated hours, files touched, and whether a reviewer is guaranteed within a week. Three numbers, printed in the issue body.\n\nWhat would you add? What would you cut?`,
    tags: ['maintainer-tools', 'conventions'],
    skills: [],
    repoUrl: null,
    repoName: null,
    difficulty: null,
    projectId: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    voters: ['usr_lina', 'usr_kenji', 'usr_maya', 'usr_amara', 'usr_sofia'],
  },
  {
    id: 'pst_glass',
    authorId: 'usr_lina',
    type: 'discussion',
    title: 'Orbit: should the glass layer be opt-in or the default?',
    body: `Orbit's primitives are unstyled. We added a \`<GlassSurface>\` layer that gives the frosted look this site uses, and now I am torn:

- **Default**: nicer out of the box, but blur has a real cost on low-end devices and can hurt contrast.
- **Opt-in**: honest and fast, but every consumer rebuilds the same 12 lines of CSS.

Current plan: opt-in, with a \`prefers-reduced-transparency\` fallback that degrades to a solid surface with a subtle border. Still undecided on whether to ship a \`<GlassPanel>\` composite.`,
    tags: ['design-system', 'performance'],
    skills: [],
    repoUrl: 'https://github.com/lets-contribute/orbit-ui/discussions/12',
    repoName: 'lets-contribute/orbit-ui',
    difficulty: null,
    projectId: 'prj_orbit',
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(19),
    voters: ['usr_noor', 'usr_maya', 'usr_yusuf', 'usr_diego'],
  },
  {
    id: 'pst_listen',
    authorId: 'usr_sofia',
    type: 'discussion',
    title: 'Neon Notes: LISTEN/NOTIFY or polling for cross-tab sync?',
    body: `Two tabs, one document. Right now each tab polls every 2s and applies the CRDT update. It works, it is boring, and it costs a query per tab per tick.

\`LISTEN/NOTIFY\` over the direct (non-pooled) connection would remove the polling entirely, but pooled serverless connections cannot hold a listener open. So the options are:

1. Keep polling, tune the interval per document activity.
2. One small always-on websocket relay that listens and fans out.
3. Server-sent events from a Neon branch, reconnecting on cold start.

Leaning 1 for now with a 800ms debounce. Has anyone run option 2 cheaply on Vercel?`,
    tags: ['postgres', 'realtime'],
    skills: [],
    repoUrl: 'https://github.com/lets-contribute/neon-notes/discussions/31',
    repoName: 'lets-contribute/neon-notes',
    difficulty: null,
    projectId: 'prj_neonnotes',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    voters: ['usr_yusuf', 'usr_priya', 'usr_samuel', 'usr_lina'],
  },
  {
    id: 'pst_licence',
    authorId: 'usr_amara',
    type: 'discussion',
    title: 'Tunis Trails: ODbL for derived trail data?',
    body: `We import from OpenStreetMap, so derived data must stay ODbL — but our own editorial layer (route descriptions, difficulty ratings, photos) is currently MIT, which creates a licensing seam.

Three options:

1. Everything ODbL. Simplest, scares off some consumers.
2. Split repositories: \`tunis-trails-data\` (ODbL) and \`tunis-trails-app\` (MIT).
3. Keep MIT and treat the OSM extract as a build artefact that is never redistributed.

I think 2 is correct but it doubles the maintenance. Would love input from someone who has shipped OSM-derived data before.`,
    tags: ['open-data', 'licensing'],
    skills: [],
    repoUrl: null,
    repoName: null,
    difficulty: null,
    projectId: 'prj_trails',
    createdAt: hoursAgo(40),
    updatedAt: hoursAgo(16),
    voters: ['usr_elena', 'usr_kenji', 'usr_maya'],
  },
  {
    id: 'pst_autolabel',
    authorId: 'usr_kenji',
    type: 'discussion',
    title: 'Patchwork: how aggressive should auto-labelling be?',
    body: `We can now label new issues with ~88% precision on our test corpus. The remaining 12% is where it gets interesting: confident wrong labels are worse than no labels, because a maintainer has to notice and undo them.

Proposal: only apply a label above 0.9 confidence, otherwise post a quiet suggestion as a comment ("this looks like \`area: audio\` — correct me if not"). Maintainers can promote a suggestion with one click, and that becomes training signal.

Too conservative? Too chattery?`,
    tags: ['maintainer-tools', 'automation'],
    skills: [],
    repoUrl: 'https://github.com/lets-contribute/patchwork/discussions/8',
    repoName: 'lets-contribute/patchwork',
    difficulty: null,
    projectId: 'prj_patchwork',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
    voters: ['usr_priya', 'usr_sofia', 'usr_lina', 'usr_yusuf', 'usr_elena'],
  },
  {
    id: 'pst_commandstack',
    authorId: 'usr_tomas',
    type: 'discussion',
    title: 'Sonic Loom: moving the editor state to a command stack',
    body: `Undo is currently a snapshot array — every edit pushes a full project clone. At 4 minutes of audio that is 40MB of history and the tab dies.

I want a command stack: each edit is \`{ type, apply(context), revert(context) }\`, and undo/redo just walks it. It also unlocks collaborative editing later, since commands are naturally serialisable.

Risk: commands need to be total (never fail mid-apply) or the history corrupts. Happy to write the design doc if two people promise to review it.`,
    tags: ['architecture', 'web-audio'],
    skills: [],
    repoUrl: null,
    repoName: null,
    difficulty: null,
    projectId: 'prj_loom',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(3),
    voters: ['usr_kenji', 'usr_diego', 'usr_sofia'],
  },
];

const comments: SeedComment[] = [
  {
    id: 'cmt_1',
    postId: 'pst_combobox',
    authorId: 'usr_noor',
    body: 'I have shipped exactly zero PRs but this is the first issue where I understood every word. Is the test scaffold something I can run locally before touching the component?',
    createdAt: hoursAgo(4),
  },
  {
    id: 'cmt_2',
    postId: 'pst_combobox',
    authorId: 'usr_lina',
    body: 'Yes — `npm run test -- combobox` works on a clean clone, and the three failing keyboard tests are the spec. If you want, open a draft PR with just the tests passing and I will review it this evening.',
    createdAt: hoursAgo(3),
  },
  {
    id: 'cmt_3',
    postId: 'pst_combobox',
    authorId: 'usr_diego',
    body: 'Seconding this. I did my first PR on Orbit last month and the "here is the failing test" pattern made it genuinely approachable.',
    createdAt: hoursAgo(2),
  },
  {
    id: 'cmt_4',
    postId: 'pst_conflict',
    authorId: 'usr_yusuf',
    body: 'Do you keep per-client snapshots or just a merged doc? The byline is much easier if you retain the client id per update — otherwise you reconstruct authorship from the Yjs delete-set and it gets muddy.',
    createdAt: hoursAgo(6),
  },
  {
    id: 'cmt_5',
    postId: 'pst_conflict',
    authorId: 'usr_sofia',
    body: 'We keep an update log per client id in `sync_log`, so the byline is a join, not an inference. The visualiser is the missing half.',
    createdAt: hoursAgo(5),
  },
  {
    id: 'cmt_6',
    postId: 'pst_ruleengine',
    authorId: 'usr_tomas',
    body: 'Before you port: 88% precision sounds like the rules are doing less work than you think. Do you have a confusion matrix per rule? Half a day of analysis might delete 400 lines of that if-else nest.',
    createdAt: hoursAgo(16),
  },
  {
    id: 'cmt_7',
    postId: 'pst_ruleengine',
    authorId: 'usr_kenji',
    body: 'That is a fair hit. I will publish the per-rule matrix this week and if the port still makes sense afterwards, the issue stays open.',
    createdAt: hoursAgo(15),
  },
  {
    id: 'cmt_8',
    postId: 'pst_osm',
    authorId: 'usr_samuel',
    body: 'Overpass has a rate limit that will bite on the second run. Cache the raw JSON to disk and make the script resumable — you will thank yourself.',
    createdAt: hoursAgo(22),
  },
  {
    id: 'cmt_9',
    postId: 'pst_pairing',
    authorId: 'usr_maya',
    body: 'In. CET room, and I will bring Neon Notes docs issues. Two of them are 20-minute fixes if someone is on the call to unblock.',
    createdAt: hoursAgo(11),
  },
  {
    id: 'cmt_10',
    postId: 'pst_pairing',
    authorId: 'usr_amara',
    body: 'I can take the PT-friendly slot every other week. Also: please do not record. First-timers ask better questions when nobody is archiving them.',
    createdAt: hoursAgo(9),
  },
  {
    id: 'cmt_11',
    postId: 'pst_passport',
    authorId: 'usr_elena',
    body: 'Weight reviews heavily and you will get review farming. Weight *substantive* reviews (comments longer than 3 words, changes requested, approvals after a rework) and it holds up better.',
    createdAt: hoursAgo(21),
  },
  {
    id: 'cmt_12',
    postId: 'pst_glass',
    authorId: 'usr_noor',
    body: 'Opt-in, but ship the reduced-transparency fallback in the same PR. Half the value of a glass layer is that it degrades gracefully instead of looking broken on a 2019 laptop.',
    createdAt: hoursAgo(20),
  },
  {
    id: 'cmt_13',
    postId: 'pst_glass',
    authorId: 'usr_yusuf',
    body: 'Also watch contrast on the 8% white surface over a bright gradient. Our audit failed at 3.9:1 until we bumped the border opacity.',
    createdAt: hoursAgo(18),
  },
  {
    id: 'cmt_14',
    postId: 'pst_listen',
    authorId: 'usr_priya',
    body: 'Option 2 is cheap if the relay is dumb: one Bun process on Fly, ~2MB RAM, LISTEN on Neon and fan out over SSE. We run exactly this for a dashboard with 300 tabs and it costs less than the polling did.',
    createdAt: daysAgo(3),
  },
  {
    id: 'cmt_15',
    postId: 'pst_listen',
    authorId: 'usr_sofia',
    body: 'SSE relay is tempting. Does it survive Neon branch suspends without a reconnect storm?',
    createdAt: daysAgo(2),
  },
  {
    id: 'cmt_16',
    postId: 'pst_licence',
    authorId: 'usr_elena',
    body: 'Option 2, and put the licence boundary in CI: a check that fails if a file in the app repo contains an OSM id. Cheap, and it stops the drift before it becomes a legal question.',
    createdAt: hoursAgo(30),
  },
  {
    id: 'cmt_17',
    postId: 'pst_autolabel',
    authorId: 'usr_maya',
    body: 'Quiet suggestion is the right call. A wrong label teaches maintainers to distrust the bot permanently; a comment is a nudge they can ignore.',
    createdAt: daysAgo(4),
  },
  {
    id: 'cmt_18',
    postId: 'pst_commandstack',
    authorId: 'usr_diego',
    body: 'Serialisable commands are also how you get multi-track undo right later. Do the design doc — I will review it.',
    createdAt: daysAgo(5),
  },
  {
    id: 'cmt_19',
    postId: 'pst_labeltrans',
    authorId: 'usr_lina',
    body: 'Add "files touched" and I am happy. Estimated hours are always wrong in the optimistic direction, but a file count is hard to lie about.',
    createdAt: hoursAgo(20),
  },
  {
    id: 'cmt_20',
    postId: 'pst_docs',
    authorId: 'usr_noor',
    body: 'I will take this. I am not a backend person, which is probably exactly the qualification needed for a self-hosting guide.',
    createdAt: daysAgo(2),
  },
];

export const seed = {
  users,
  projects,
  posts,
  comments,
  demoUser: {
    id: 'usr_guest',
    login: 'guest-contributor',
    name: 'Guest Contributor',
    bio: 'Exploring the demo. Sign in with GitHub to keep your own contributions.',
    location: 'Everywhere',
    avatarUrl: null,
    githubUrl: '',
    isDemo: true,
    createdAt: daysAgo(1),
  } satisfies SeedUser,
};
