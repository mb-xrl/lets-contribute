import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * Favicon generated at build time from layout primitives — no hand-drawn SVG.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(140deg, #6ee7d0 0%, #7dd3fc 46%, #a78bfa 100%)',
          borderRadius: 16,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, color: '#05060f', letterSpacing: -1 }}>
          LC
        </div>
      </div>
    ),
    { ...size },
  );
}
