export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <div className="absolute inset-0 bg-[radial-gradient(58%_48%_at_16%_-6%,rgba(110,231,208,0.18),transparent_62%),radial-gradient(52%_44%_at_86%_-2%,rgba(167,139,250,0.24),transparent_60%),radial-gradient(58%_46%_at_62%_104%,rgba(56,189,248,0.16),transparent_64%),radial-gradient(40%_36%_at_4%_84%,rgba(240,171,252,0.13),transparent_66%)]" />
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:radial-gradient(92%_62%_at_50%_0%,#000_8%,transparent_76%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}
