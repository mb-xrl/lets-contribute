'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PublicUser } from '@lets-contribute/shared';
import { apiFetch } from '@/lib/client';
import { Button, GlassCard, Spinner } from './ui/primitives';
import { Icon } from './ui/icon';

export function ProfileEditor({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(user.bio ?? '');
  const [location, setLocation] = useState(user.location ?? '');
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await apiFetch<{ user: PublicUser }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ bio, location }),
    });
    setPending(false);
    if (result.ok) {
      setSaved(true);
      setOpen(false);
      router.refresh();
      window.setTimeout(() => setSaved(false), 2000);
    } else {
      setError(result.error);
    }
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-dim">
          <Icon name="penLine" className="h-3.5 w-3.5 text-aurora-sky" />
          This is your profile
          {saved ? <span className="text-emerald-300">· saved</span> : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
          <Icon name={open ? 'x' : 'settings'} className="h-3.5 w-3.5" />
          {open ? 'Close' : 'Edit'}
        </Button>
      </div>

      {open ? (
        <form onSubmit={save} className="mt-3 grid gap-3 border-t border-white/[0.07] pt-3">
          <label className="grid gap-1.5">
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-faint">
              Bio ({bio.length}/280)
            </span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 280))}
              rows={3}
              placeholder={'What do you work on? What do you want to learn?'}
              className="field resize-y"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-faint">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value.slice(0, 80))}
              placeholder={location || 'Tunis, Tunisia'}
              className="field"
            />
          </label>
          {error ? <p className="text-xs text-rose-300">{error}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Spinner /> : <Icon name="check" className="h-3.5 w-3.5" />}
              Save profile
            </Button>
          </div>
        </form>
      ) : null}
    </GlassCard>
  );
}
