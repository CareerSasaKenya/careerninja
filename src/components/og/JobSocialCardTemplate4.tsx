import React from 'react';
import {
  OG_CARD_SIZES,
  OG_COLORS,
  truncateWords,
  type OgJobCardData,
} from '@/lib/ogJobCardDesign';
import {
  BrandFooterBar,
  CompanyLogoBox,
  IconMegaphone,
  buildMetaChips,
  hexPoints,
} from '@/components/og/ogShared';

/**
 * Template 4 — Light professional card with hexagonal portrait frame.
 * Review only via `?template=4`. Purple accents remapped to CareerSasa blue.
 */
export function JobSocialCardTemplate4(data: OgJobCardData) {
  const { width, height } = OG_CARD_SIZES[data.size];
  const s = Math.min(width / 1200, height / 630);
  const stripW = Math.max(5, Math.round(6 * s));
  const footerH = Math.round(82 * s);
  const portrait = Math.round(318 * s);
  const frame = portrait + Math.round(28 * s);
  const titleSize = Math.round(
    (data.title.length > 36 ? 44 : data.title.length > 24 ? 54 : 62) * s,
  );
  const displayTitle = truncateWords(data.title, data.title.length > 40 ? 48 : 56);
  const chips = buildMetaChips(
    data,
    Math.round(18 * s),
    OG_COLORS.primaryBlue,
    truncateWords,
    'Trusted & Verified',
  );
  const chipRows: (typeof chips)[] = [];
  for (let i = 0; i < chips.length; i += 2) chipRows.push(chips.slice(i, i + 2));
  const hx = frame / 2;
  const hy = frame / 2;
  const hr = portrait / 2 + Math.round(4 * s);
  const clipId = 't4-hex-clip';

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter',
        background: 'linear-gradient(160deg, #F7FAFF 0%, #EEF4FB 55%, #E8F1FA 100%)',
      }}
    >
      {/* Soft dot grid */}
      {[0, 1, 2, 3, 4, 5].map((row) =>
        [0, 1, 2, 3, 4, 5, 6].map((col) => (
          <div
            key={`d-${row}-${col}`}
            style={{
              position: 'absolute',
              left: `${Math.round((520 + col * 16) * s)}px`,
              top: `${Math.round((40 + row * 16) * s)}px`,
              width: `${Math.max(2, Math.round(3 * s))}px`,
              height: `${Math.max(2, Math.round(3 * s))}px`,
              borderRadius: '50%',
              backgroundColor: 'rgba(21,101,192,0.10)',
              display: 'flex',
            }}
          />
        )),
      )}
      <div
        style={{
          position: 'absolute',
          right: `${Math.round(-80 * s)}px`,
          top: `${Math.round(-60 * s)}px`,
          width: `${Math.round(340 * s)}px`,
          height: `${Math.round(340 * s)}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(21,101,192,0.08), transparent 70%)',
          display: 'flex',
        }}
      />

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

      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          padding: `${Math.round(34 * s)}px ${Math.round(36 * s)}px ${Math.round(10 * s)}px ${
            stripW + Math.round(34 * s)
          }px`,
          gap: `${Math.round(20 * s)}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: `${Math.round(600 * s)}px`,
            gap: `${Math.round(13 * s)}px`,
          }}
        >
          <CompanyLogoBox
            src={data.companyLogoSrc}
            companyName={data.companyName}
            size={Math.round(70 * s)}
          />

          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: `${Math.round(8 * s)}px`,
              padding: `${Math.round(7 * s)}px ${Math.round(14 * s)}px`,
              borderRadius: `${Math.round(999 * s)}px`,
              backgroundColor: OG_COLORS.primaryBlue,
              color: OG_COLORS.white,
              fontSize: `${Math.round(14 * s)}px`,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <IconMegaphone size={Math.round(18 * s)} color={OG_COLORS.white} />
            {"WE'RE HIRING"}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: `${titleSize}px`,
              fontWeight: 800,
              color: '#0A1F44',
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              maxWidth: `${Math.round(560 * s)}px`,
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              width: `${Math.round(48 * s)}px`,
              height: `${Math.round(4 * s)}px`,
              borderRadius: 2,
              backgroundColor: OG_COLORS.accentOrange,
              display: 'flex',
            }}
          />

          <div
            style={{
              display: 'flex',
              fontSize: `${Math.round(26 * s)}px`,
              fontWeight: 600,
              color: '#1A335C',
            }}
          >
            {truncateWords(data.companyName, 36)}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${Math.round(10 * s)}px`,
              marginTop: `${Math.round(2 * s)}px`,
            }}
          >
            {chipRows.map((row, idx) => (
              <div
                key={`r-${idx}`}
                style={{ display: 'flex', gap: `${Math.round(10 * s)}px` }}
              >
                {row.map((chip) => (
                  <div
                    key={chip.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${Math.round(8 * s)}px`,
                      padding: `${Math.round(10 * s)}px ${Math.round(14 * s)}px`,
                      borderRadius: `${Math.round(14 * s)}px`,
                      border: '1px solid rgba(21,101,192,0.12)',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      color: '#102A56',
                      fontSize: `${Math.round(18 * s)}px`,
                      fontWeight: 600,
                      boxShadow: '0 4px 14px rgba(13,71,161,0.06)',
                    }}
                  >
                    {chip.icon}
                    <span>{chip.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${Math.round(20 * s)}px`,
          }}
        >
          {data.personImageSrc ? (
            <div
              style={{
                width: `${frame}px`,
                height: `${frame}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <svg width={frame} height={frame} viewBox={`0 0 ${frame} ${frame}`}>
                <defs>
                  <clipPath id={clipId}>
                    <polygon points={hexPoints(hx, hy, hr)} />
                  </clipPath>
                  <linearGradient id="t4-hex-stroke" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={OG_COLORS.primaryBlue} />
                    <stop offset="100%" stopColor={OG_COLORS.primaryBlueDeep} />
                  </linearGradient>
                </defs>
                <polygon
                  points={hexPoints(hx, hy, hr + Math.round(8 * s))}
                  fill="rgba(21,101,192,0.10)"
                />
                <image
                  href={data.personImageSrc}
                  x={hx - hr}
                  y={hy - hr}
                  width={hr * 2}
                  height={hr * 2}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${clipId})`}
                />
                <polygon
                  points={hexPoints(hx, hy, hr)}
                  fill="none"
                  stroke="url(#t4-hex-stroke)"
                  strokeWidth={Math.round(7 * s)}
                />
                <polygon
                  points={hexPoints(hx, hy, hr + Math.round(3 * s))}
                  fill="none"
                  stroke={OG_COLORS.accentOrange}
                  strokeWidth={Math.round(2.5 * s)}
                  strokeDasharray={`${Math.round(52 * s)} ${Math.round(420 * s)}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${Math.round(12 * s)}px`,
              padding: `${Math.round(14 * s)}px ${Math.round(28 * s)}px`,
              borderRadius: `${Math.round(16 * s)}px`,
              background: `linear-gradient(135deg, ${OG_COLORS.accentOrange}, ${OG_COLORS.accentOrangeDeep})`,
              color: OG_COLORS.white,
              fontSize: `${Math.round(24 * s)}px`,
              fontWeight: 800,
              letterSpacing: '0.04em',
              boxShadow: '0 12px 28px rgba(255,122,0,0.30)',
            }}
          >
            <span>APPLY NOW</span>
            <div
              style={{
                width: `${Math.round(36 * s)}px`,
                height: `${Math.round(36 * s)}px`,
                borderRadius: '50%',
                backgroundColor: OG_COLORS.white,
                color: OG_COLORS.accentOrange,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${Math.round(22 * s)}px`,
                fontWeight: 800,
              }}
            >
              →
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          marginLeft: `${stripW + Math.round(14 * s)}px`,
          marginRight: `${Math.round(14 * s)}px`,
          marginBottom: `${Math.round(14 * s)}px`,
          borderTop: `${Math.max(1, Math.round(1 * s))}px solid rgba(21,101,192,0.08)`,
          paddingTop: `${Math.round(2 * s)}px`,
        }}
      >
        <BrandFooterBar brandLogoSrc={data.brandLogoSrc} s={s} height={footerH} />
      </div>
    </div>
  );
}
