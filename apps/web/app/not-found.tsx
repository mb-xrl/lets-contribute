import { ButtonLink, GlassCard } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icon';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <GlassCard glow className="max-w-lg px-8 py-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06]">
          <Icon name="telescope" className="h-5 w-5 text-aurora-sky" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-white">Nothing lives at this address</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-dim">
          The post may have been deleted, or the link was mistyped. The feed is still where everything
          happens.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <ButtonLink href="/feed" size="sm">
            <Icon name="compass" className="h-3.5 w-3.5" />
            Go to the feed
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="sm">
            <Icon name="home" className="h-3.5 w-3.5" />
            Home
          </ButtonLink>
        </div>
      </GlassCard>
    </div>
  );
}
