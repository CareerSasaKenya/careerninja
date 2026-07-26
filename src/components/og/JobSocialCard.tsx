import React from 'react';
import {
  OG_COLORS,
  OG_CARD_SIZES,
  truncateWords,
  type OgJobCardData,
} from '@/lib/ogJobCardDesign';

/** Inline SVG icons (single family) for metadata chips — Satori-safe */
function IconPin({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function IconBriefcase({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zm0 4h4V4h-4v2z" />
    </svg>
  );
}

function IconMonitor({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H8v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z" />
    </svg>
  );
}

function IconShield({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5l8-3zm-1 13.2l5.6-5.6-1.4-1.4-4.2 4.2-2-2-1.4 1.4 3.4 3.4z" />
    </svg>
  );
}

function Chip({
  icon,
  label,
  fontSize,
  padX,
  padY,
  gap,
  radius,
}: {
  icon: React.ReactNode;
  label: string;
  fontSize: number;
  padX: number;
  padY: number;
  gap: number;
  radius: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${gap}px`,
        padding: `${padY}px ${padX}px`,
        borderRadius: `${radius}px`,
        border: `1.5px solid ${OG_COLORS.borderSubtle}`,
        backgroundColor: OG_COLORS.chipBg,
        color: OG_COLORS.white,
        fontSize: `${fontSize}px`,
        fontWeight: 600,
        fontFamily: 'Inter',
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

/**
 * Premium CareerSasa social job card for @vercel/og ImageResponse.
 * Layout is driven by OgJobCardData — safe with missing optional fields.
 */
export function JobSocialCard(data: OgJobCardData) {
  const { width, height } = OG_CARD_SIZES[data.size];
  const isTall = height / width > 1.05;
  const isSquare = Math.abs(height / width - 1) < 0.08;

  // 8px spacing system, scaled to canvas
  const s = Math.min(width / 1200, height / 630);
  const pad = Math.round(40 * s);
  const footerH = Math.round((isTall ? 110 : 88) * s);
  const stripW = Math.max(5, Math.round(6 * s));
  const logoBox = Math.round(72 * s);
  const titleSize = Math.round((data.title.length > 36 ? 48 : data.title.length > 24 ? 56 : 64) * s);
  const companySize = Math.round(28 * s);
  const chipFont = Math.round(20 * s);
  const portrait = Math.round((isSquare || isTall ? 380 : 340) * Math.min(s, isTall ? 0.95 : 1));
  const leftW = Math.round(width * (isTall ? 0.92 : 0.55) - pad - stripW);
  const displayTitle = truncateWords(data.title, data.title.length > 40 ? 48 : 56);

  const chips: { key: string; icon: React.ReactNode; label: string }[] = [];
  if (data.location) {
    chips.push({
      key: 'loc',
      icon: <IconPin size={Math.round(18 * s)} color={OG_COLORS.accentOrange} />,
      label: truncateWords(data.location, 22),
    });
  }
  if (data.employmentType) {
    chips.push({
      key: 'type',
      icon: <IconBriefcase size={Math.round(18 * s)} color={OG_COLORS.accentOrange} />,
      label: data.employmentType,
    });
  }
  if (data.jobFunction) {
    chips.push({
      key: 'fn',
      icon: <IconMonitor size={Math.round(18 * s)} color={OG_COLORS.accentOrange} />,
      label: truncateWords(data.jobFunction, 20),
    });
  }
  if (data.showVerified) {
    chips.push({
      key: 'ver',
      icon: <IconShield size={Math.round(18 * s)} color={OG_COLORS.white} />,
      label: 'Verified Employer',
    });
  }

  const chipRows: typeof chips[] = [];
  for (let i = 0; i < chips.length; i += 2) {
    chipRows.push(chips.slice(i, i + 2));
  }

  const leftColumn = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: isTall ? '100%' : `${leftW}px`,
        justifyContent: 'flex-start',
        gap: `${Math.round(16 * s)}px`,
      }}
    >
      {/* Employer logo */}
      <div
        style={{
          width: `${logoBox}px`,
          height: `${logoBox}px`,
          borderRadius: `${Math.round(18 * s)}px`,
          backgroundColor: OG_COLORS.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${Math.round(10 * s)}px`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {data.companyLogoSrc ? (
          <img
            src={data.companyLogoSrc}
            alt=""
            width={logoBox - Math.round(20 * s)}
            height={logoBox - Math.round(20 * s)}
            style={{
              width: `${logoBox - Math.round(20 * s)}px`,
              height: `${logoBox - Math.round(20 * s)}px`,
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: OG_COLORS.accentOrange,
              borderRadius: `${Math.round(12 * s)}px`,
              color: OG_COLORS.white,
              fontSize: `${Math.round(26 * s)}px`,
              fontWeight: 800,
              fontFamily: 'Inter',
            }}
          >
            {data.companyName
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() || '')
              .join('') || 'CS'}
          </div>
        )}
      </div>

      {/* Hiring badge */}
      <div
        style={{
          display: 'flex',
          alignSelf: 'flex-start',
          padding: `${Math.round(6 * s)}px ${Math.round(14 * s)}px`,
          borderRadius: `${Math.round(999 * s)}px`,
          border: `1.5px solid ${OG_COLORS.borderSubtle}`,
          backgroundColor: 'rgba(13,71,161,0.35)',
          color: OG_COLORS.white,
          fontSize: `${Math.round(14 * s)}px`,
          fontWeight: 700,
          letterSpacing: '0.06em',
          fontFamily: 'Inter',
        }}
      >
        {"WE'RE HIRING"}
      </div>

      {/* Title */}
      <div
        style={{
          display: 'flex',
          fontSize: `${titleSize}px`,
          fontWeight: 800,
          color: OG_COLORS.white,
          lineHeight: 1.08,
          maxWidth: isTall ? '100%' : `${Math.round(560 * s)}px`,
          fontFamily: 'Inter',
          letterSpacing: '-0.02em',
        }}
      >
        {displayTitle}
      </div>

      {/* Orange accent + company */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(10 * s)}px` }}>
        <div
          style={{
            width: `${Math.round(48 * s)}px`,
            height: `${Math.round(4 * s)}px`,
            borderRadius: `${Math.round(2 * s)}px`,
            backgroundColor: OG_COLORS.accentOrange,
            display: 'flex',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: `${companySize}px`,
            fontWeight: 600,
            color: OG_COLORS.white,
            fontFamily: 'Inter',
          }}
        >
          {truncateWords(data.companyName, 36)}
        </div>
      </div>

      {/* Metadata chips */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${Math.round(10 * s)}px`,
          marginTop: `${Math.round(4 * s)}px`,
        }}
      >
        {chipRows.map((row, idx) => (
          <div
            key={`row-${idx}`}
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: `${Math.round(10 * s)}px`,
              flexWrap: 'nowrap',
            }}
          >
            {row.map((chip) => (
              <Chip
                key={chip.key}
                icon={chip.icon}
                label={chip.label}
                fontSize={chipFont}
                padX={Math.round(14 * s)}
                padY={Math.round(10 * s)}
                gap={Math.round(8 * s)}
                radius={Math.round(16 * s)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const rightColumn = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: isTall ? 'flex-start' : 'center',
        gap: `${Math.round(24 * s)}px`,
        paddingTop: isTall ? `${Math.round(8 * s)}px` : 0,
      }}
    >
      {data.personImageSrc ? (
        <div
          style={{
            width: `${portrait}px`,
            height: `${portrait}px`,
            borderRadius: `${portrait / 2}px`,
            border: `${Math.round(6 * s)}px solid ${OG_COLORS.white}`,
            overflow: 'hidden',
            display: 'flex',
            boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
            position: 'relative',
            backgroundColor: OG_COLORS.primaryBlueDeep,
          }}
        >
          <img
            src={data.personImageSrc}
            alt=""
            width={portrait}
            height={portrait}
            style={{
              width: `${portrait}px`,
              height: `${portrait}px`,
              objectFit: 'cover',
            }}
          />
          {/* Accent dot on rim */}
          <div
            style={{
              position: 'absolute',
              top: `${Math.round(18 * s)}px`,
              right: `${Math.round(28 * s)}px`,
              width: `${Math.round(18 * s)}px`,
              height: `${Math.round(18 * s)}px`,
              borderRadius: `${Math.round(9 * s)}px`,
              backgroundColor: OG_COLORS.accentOrange,
              border: `${Math.round(3 * s)}px solid ${OG_COLORS.white}`,
              display: 'flex',
            }}
          />
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${Math.round(16 * s)}px ${Math.round(36 * s)}px`,
          borderRadius: `${Math.round(18 * s)}px`,
          background: `linear-gradient(135deg, ${OG_COLORS.accentOrange}, ${OG_COLORS.accentOrangeDeep})`,
          color: OG_COLORS.white,
          fontSize: `${Math.round(26 * s)}px`,
          fontWeight: 800,
          fontFamily: 'Inter',
          letterSpacing: '0.04em',
          boxShadow: '0 12px 28px rgba(255,122,0,0.35)',
        }}
      >
        APPLY NOW →
      </div>
    </div>
  );

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(145deg, ${OG_COLORS.primaryBlueDeep} 0%, ${OG_COLORS.primaryBlue} 55%, ${OG_COLORS.primaryBlueMid} 100%)`,
        fontFamily: 'Inter',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle geometric atmosphere (3–5% opacity) */}
      <div
        style={{
          position: 'absolute',
          top: `${Math.round(-80 * s)}px`,
          right: `${Math.round(-40 * s)}px`,
          width: `${Math.round(360 * s)}px`,
          height: `${Math.round(360 * s)}px`,
          borderRadius: `${Math.round(180 * s)}px`,
          border: `${Math.round(2 * s)}px solid rgba(255,255,255,0.06)`,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `${Math.round(-40 * s)}px`,
          right: `${Math.round(0 * s)}px`,
          width: `${Math.round(280 * s)}px`,
          height: `${Math.round(280 * s)}px`,
          borderRadius: `${Math.round(140 * s)}px`,
          border: `${Math.round(2 * s)}px solid rgba(255,255,255,0.05)`,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: `${Math.round(120 * s)}px`,
          left: `${Math.round(200 * s)}px`,
          width: `${Math.round(220 * s)}px`,
          height: `${Math.round(220 * s)}px`,
          borderRadius: `${Math.round(110 * s)}px`,
          border: `${Math.round(2 * s)}px solid rgba(255,255,255,0.04)`,
          display: 'flex',
        }}
      />
      {/* Dot grid suggestion — top right */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <div
            key={`d-${row}-${col}`}
            style={{
              position: 'absolute',
              top: `${Math.round((36 + row * 14) * s)}px`,
              right: `${Math.round((36 + col * 14) * s)}px`,
              width: `${Math.max(2, Math.round(3 * s))}px`,
              height: `${Math.max(2, Math.round(3 * s))}px`,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              display: 'flex',
            }}
          />
        )),
      )}

      {/* Category colour strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${stripW}px`,
          backgroundColor: data.categoryColor,
          display: 'flex',
        }}
      />

      {/* Main body */}
      <div
        style={{
          display: 'flex',
          flexDirection: isTall ? 'column' : 'row',
          flex: 1,
          padding: `${pad}px ${pad}px ${Math.round(16 * s)}px ${pad + stripW}px`,
          gap: `${Math.round(24 * s)}px`,
          position: 'relative',
        }}
      >
        {leftColumn}
        {rightColumn}
      </div>

      {/* Premium white footer brand signature */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: `${footerH}px`,
          marginLeft: `${stripW}px`,
          backgroundColor: OG_COLORS.white,
          borderTopLeftRadius: `${Math.round(20 * s)}px`,
          borderTopRightRadius: `${Math.round(20 * s)}px`,
          padding: `0 ${Math.round(28 * s)}px`,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.round(12 * s)}px` }}>
          {data.brandLogoSrc ? (
            <img
              src={data.brandLogoSrc}
              alt="CareerSasa"
              width={Math.round(40 * s)}
              height={Math.round(40 * s)}
              style={{
                width: `${Math.round(40 * s)}px`,
                height: `${Math.round(40 * s)}px`,
                objectFit: 'contain',
                borderRadius: `${Math.round(8 * s)}px`,
              }}
            />
          ) : null}
          <div
            style={{
              display: 'flex',
              fontSize: `${Math.round(26 * s)}px`,
              fontWeight: 800,
              color: OG_COLORS.primaryBlue,
              fontFamily: 'Inter',
            }}
          >
            CareerSasa
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${Math.round(16 * s)}px`,
          }}
        >
          <div
            style={{
              width: `${Math.max(1, Math.round(1.5 * s))}px`,
              height: `${Math.round(36 * s)}px`,
              backgroundColor: '#D0D7DE',
              display: 'flex',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.round(2 * s)}px` }}>
            <div
              style={{
                display: 'flex',
                fontSize: `${Math.round(16 * s)}px`,
                fontWeight: 700,
                color: '#1F2937',
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
                color: OG_COLORS.textMuted,
                fontFamily: 'Inter',
              }}
            >
              Find. Apply. Grow.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${Math.round(8 * s)}px`,
            color: OG_COLORS.primaryBlue,
            fontSize: `${Math.round(18 * s)}px`,
            fontWeight: 700,
            fontFamily: 'Inter',
          }}
        >
          <svg width={Math.round(20 * s)} height={Math.round(20 * s)} viewBox="0 0 24 24" fill={OG_COLORS.primaryBlue}>
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 17.9V18h-2v1.9A8 8 0 0 1 4.1 13H6v-2H4.1A8 8 0 0 1 11 4.1V6h2V4.1A8 8 0 0 1 19.9 11H18v2h1.9A8 8 0 0 1 13 19.9z" />
          </svg>
          <span>careersasa.co.ke</span>
        </div>
      </div>
    </div>
  );
}
