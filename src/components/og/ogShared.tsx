import React from 'react';
import { OG_COLORS } from '@/lib/ogJobCardDesign';

export function IconPin({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

export function IconBriefcase({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zm0 4h4V4h-4v2z" />
    </svg>
  );
}

export function IconMonitor({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H8v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z" />
    </svg>
  );
}

export function IconShield({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5l8-3zm-1 13.2l5.6-5.6-1.4-1.4-4.2 4.2-2-2-1.4 1.4 3.4 3.4z" />
    </svg>
  );
}

export function IconGlobe({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15.5 15.5 0 0 0-1.3-5A8 8 0 0 1 18.9 11zM12 4c.8 1 1.6 3.3 1.9 7h-3.8C10.4 7.3 11.2 5 12 4zM9.4 6a15.5 15.5 0 0 0-1.3 5h-3A8 8 0 0 1 9.4 6zM5.1 13h3a15.5 15.5 0 0 0 1.3 5A8 8 0 0 1 5.1 13zm6.9 7c-.8-1-1.6-3.3-1.9-7h3.8c-.3 3.7-1.1 6-1.9 7zm2.6-2a15.5 15.5 0 0 0 1.3-5h3a8 8 0 0 1-4.3 5z" />
    </svg>
  );
}

export function IconMegaphone({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3 10v4a2 2 0 0 0 2 2h2l2 5h3l-2-5 8 3V5l-11 4H5a2 2 0 0 0-2 2v-1zm17-2.5a6 6 0 0 1 0 9v-9z" />
    </svg>
  );
}

export function CompanyLogoBox({
  src,
  companyName,
  size,
  radius = 18,
}: {
  src: string | null;
  companyName: string;
  size: number;
  radius?: number;
}) {
  const pad = Math.round(size * 0.16);
  const inner = size - pad * 2;
  const initials =
    companyName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'CS';

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        backgroundColor: OG_COLORS.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${pad}px`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          width={inner}
          height={inner}
          style={{ width: `${inner}px`, height: `${inner}px`, objectFit: 'contain' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: `${Math.round(radius * 0.65)}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: OG_COLORS.lightBlue,
            color: OG_COLORS.primaryBlue,
            fontSize: `${Math.round(size * 0.32)}px`,
            fontWeight: 800,
            fontFamily: 'Inter',
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export function CareerSasaWordmark({ fontSize }: { fontSize: number }) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        fontFamily: 'Inter',
      }}
    >
      <span style={{ color: OG_COLORS.primaryBlue }}>Career</span>
      <span style={{ color: OG_COLORS.accentOrange }}>Sasa</span>
    </div>
  );
}

export function BrandFooterBar({
  brandLogoSrc,
  s,
  height,
  variant = 'light',
  qrCodeSrc,
}: {
  brandLogoSrc: string | null;
  s: number;
  height: number;
  variant?: 'light' | 'brandDark';
  qrCodeSrc?: string | null;
}) {
  const isDark = variant === 'brandDark';
  const textPrimary = isDark ? OG_COLORS.white : '#102A56';
  const textMuted = isDark ? 'rgba(255,255,255,0.78)' : '#66758A';
  const divider = isDark ? 'rgba(255,255,255,0.28)' : '#D3DAE5';
  const linkColor = isDark ? OG_COLORS.white : OG_COLORS.primaryBlue;
  const logoSize = Math.round(46 * s);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: `${height}px`,
        width: '100%',
        backgroundColor: isDark ? OG_COLORS.primaryBlueDeep : OG_COLORS.white,
        borderRadius: `${Math.round(18 * s)}px`,
        padding: `0 ${Math.round(24 * s)}px`,
        boxShadow: isDark ? 'none' : '0 8px 28px rgba(13,71,161,0.14)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(10 * s)}px` }}>
        {brandLogoSrc ? (
          <img
            src={brandLogoSrc}
            alt="CareerSasa"
            width={logoSize}
            height={logoSize}
            style={{
              width: `${logoSize}px`,
              height: `${logoSize}px`,
              objectFit: 'contain',
            }}
          />
        ) : null}
        {isDark ? (
          <div
            style={{
              display: 'flex',
              fontSize: `${Math.round(26 * s)}px`,
              fontWeight: 800,
              fontFamily: 'Inter',
              color: OG_COLORS.white,
            }}
          >
            <span>Career</span>
            <span style={{ color: OG_COLORS.accentOrange }}>Sasa</span>
          </div>
        ) : (
          <CareerSasaWordmark fontSize={Math.round(26 * s)} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(16 * s)}px` }}>
        <div
          style={{
            width: `${Math.max(1, Math.round(1.5 * s))}px`,
            height: `${Math.round(36 * s)}px`,
            backgroundColor: divider,
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * s)}px` }}>
          <div
            style={{
              display: 'flex',
              fontSize: `${Math.round(16 * s)}px`,
              fontWeight: 700,
              color: textPrimary,
              fontFamily: 'Inter',
            }}
          >
            AI-Powered Job Search
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: `${Math.round(14 * s)}px`,
              fontWeight: 500,
              color: textMuted,
              fontFamily: 'Inter',
            }}
          >
            Find. Apply. Grow.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(14 * s)}px` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${Math.round(8 * s)}px`,
            color: linkColor,
            fontSize: `${Math.round(17 * s)}px`,
            fontWeight: 700,
            fontFamily: 'Inter',
          }}
        >
          <IconGlobe size={Math.round(20 * s)} color={linkColor} />
          <span>careersasa.co.ke</span>
        </div>
        {qrCodeSrc ? (
          <img
            src={qrCodeSrc}
            alt=""
            width={Math.round(54 * s)}
            height={Math.round(54 * s)}
            style={{
              width: `${Math.round(54 * s)}px`,
              height: `${Math.round(54 * s)}px`,
              borderRadius: `${Math.round(6 * s)}px`,
              backgroundColor: OG_COLORS.white,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export type MetaChip = {
  key: string;
  icon: React.ReactNode;
  label: string;
};

export function buildMetaChips(
  data: {
    location: string | null;
    employmentType: string | null;
    jobFunction: string | null;
    showVerified: boolean;
  },
  iconSize: number,
  iconColor: string,
  truncate: (text: string, max: number) => string,
  verifiedLabel = 'Verified Employer',
): MetaChip[] {
  const chips: MetaChip[] = [];
  if (data.location) {
    chips.push({
      key: 'loc',
      icon: <IconPin size={iconSize} color={iconColor} />,
      label: truncate(data.location, 22),
    });
  }
  if (data.employmentType) {
    chips.push({
      key: 'type',
      icon: <IconBriefcase size={iconSize} color={iconColor} />,
      label: data.employmentType,
    });
  }
  if (data.jobFunction) {
    chips.push({
      key: 'fn',
      icon: <IconMonitor size={iconSize} color={iconColor} />,
      label: truncate(data.jobFunction, 20),
    });
  }
  if (data.showVerified) {
    chips.push({
      key: 'ver',
      icon: <IconShield size={iconSize} color={iconColor} />,
      label: verifiedLabel,
    });
  }
  return chips;
}

/** Regular flat-top hexagon polygon points */
export function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

/** Slanted / bold hexagon used by the high-contrast template */
export function slantedHexPoints(cx: number, cy: number, r: number): string {
  const skew = r * 0.18;
  const pts = [
    [cx + r * 0.95 + skew, cy],
    [cx + r * 0.45 + skew, cy - r * 0.92],
    [cx - r * 0.55 + skew * 0.2, cy - r * 0.78],
    [cx - r * 0.95 - skew * 0.3, cy + r * 0.05],
    [cx - r * 0.4 - skew, cy + r * 0.9],
    [cx + r * 0.55, cy + r * 0.78],
  ];
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}
