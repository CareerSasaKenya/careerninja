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
  slantedHexPoints,
} from '@/components/og/ogShared';

/**
 * Template 6 — Bold high-contrast black + CareerSasa orange accents,
 * slanted hexagonal portrait, optional QR in footer.
 * Review only via `?template=6`.
 */
export function JobSocialCardTemplate6(data: OgJobCardData) {
  const { width, height } = OG_CARD_SIZES[data.size];
  const s = Math.min(width / 1200, height / 630);
  const stripW = Math.max(5, Math.round(6 * s));
  const footerH = Math.round(86 * s);
  const portrait = Math.round(300 * s);
  const frame = portrait + Math.round(48 * s);
  const titleSize = Math.round(
    (data.title.length > 36 ? 44 : data.title.length > 24 ? 54 : 62) * s,
  );
  const displayTitle = truncateWords(data.title, data.title.length > 40 ? 48 : 56);
  const titleParts = displayTitle.trim().split(/\s+/);
  const titleHead = titleParts.length > 1 ? titleParts.slice(0, -1).join(' ') : displayTitle;
  const titleTail = titleParts.length > 1 ? titleParts[titleParts.length - 1] : '';

  const chips = buildMetaChips(
    data,
    Math.round(18 * s),
    OG_COLORS.accentOrange,
    truncateWords,
    'Trusted & Verified',
  );
  const chipRows: (typeof chips)[] = [];
  for (let i = 0; i < chips.length; i += 2) chipRows.push(chips.slice(i, i + 2));

  const hx = frame / 2;
  const hy = frame / 2;
  const hr = portrait / 2 + Math.round(14 * s);

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
        backgroundColor: '#0A0A0A',
      }}
    >
      {/* Orange diagonal accent bars */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <polygon
          points={`${width * 0.72},0 ${width},0 ${width},${height * 0.18} ${width * 0.58},${
            height * 0.05
          }`}
          fill={OG_COLORS.accentOrange}
          opacity="0.92"
        />
        <polygon
          points={`${width * 0.78},${height * 0.08} ${width},${height * 0.02} ${width},${
            height * 0.28
          } ${width * 0.68},${height * 0.16}`}
          fill={OG_COLORS.primaryBlue}
          opacity="0.55"
        />
        <line
          x1={width * 0.55}
          y1={0}
          x2={width * 0.95}
          y2={height * 0.35}
          stroke={OG_COLORS.accentOrange}
          strokeWidth={Math.round(3 * s)}
          opacity="0.35"
        />
        <line
          x1={width * 0.62}
          y1={0}
          x2={width}
          y2={height * 0.3}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={Math.round(2 * s)}
        />
      </svg>

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
          padding: `${Math.round(34 * s)}px ${Math.round(34 * s)}px ${Math.round(10 * s)}px ${
            stripW + Math.round(34 * s)
          }px`,
          gap: `${Math.round(18 * s)}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: `${Math.round(600 * s)}px`,
            gap: `${Math.round(12 * s)}px`,
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
              backgroundColor: OG_COLORS.accentOrange,
              color: OG_COLORS.white,
              fontSize: `${Math.round(14 * s)}px`,
              fontWeight: 800,
              letterSpacing: '0.05em',
            }}
          >
            <IconMegaphone size={Math.round(18 * s)} color={OG_COLORS.white} />
            {"WE'RE HIRING"}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize: `${titleSize}px`,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: `${Math.round(560 * s)}px`,
              gap: `${Math.round(12 * s)}px`,
            }}
          >
            <span style={{ color: OG_COLORS.white }}>{titleHead}</span>
            {titleTail ? (
              <span style={{ color: OG_COLORS.accentOrange }}>{titleTail}</span>
            ) : null}
          </div>

          <div
            style={{
              width: `${Math.round(56 * s)}px`,
              height: `${Math.round(4 * s)}px`,
              borderRadius: 2,
              backgroundColor: OG_COLORS.primaryBlue,
              display: 'flex',
            }}
          />

          <div
            style={{
              display: 'flex',
              fontSize: `${Math.round(26 * s)}px`,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {truncateWords(data.companyName, 36)}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${Math.round(10 * s)}px`,
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
                      borderRadius: `${Math.round(12 * s)}px`,
                      backgroundColor: '#1A1A1A',
                      border: '1px solid rgba(255,122,0,0.28)',
                      color: OG_COLORS.white,
                      fontSize: `${Math.round(18 * s)}px`,
                      fontWeight: 600,
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
            gap: `${Math.round(18 * s)}px`,
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
              {/* Slanted hex ring is stroke-only; photo stays circular (Satori-safe). */}
              <svg
                width={frame}
                height={frame}
                viewBox={`0 0 ${frame} ${frame}`}
                style={{ position: 'absolute', inset: 0 }}
              >
                <polygon
                  points={slantedHexPoints(hx, hy, hr + Math.round(8 * s))}
                  fill="rgba(255,122,0,0.16)"
                />
                <polygon
                  points={slantedHexPoints(hx, hy, hr)}
                  fill="none"
                  stroke={OG_COLORS.accentOrange}
                  strokeWidth={Math.round(10 * s)}
                />
                <polygon
                  points={slantedHexPoints(hx, hy, hr + Math.round(6 * s))}
                  fill="none"
                  stroke={OG_COLORS.primaryBlue}
                  strokeWidth={Math.round(3 * s)}
                  opacity="0.75"
                />
              </svg>
              <div
                style={{
                  width: `${portrait}px`,
                  height: `${portrait}px`,
                  borderRadius: `${portrait / 2}px`,
                  border: `${Math.round(5 * s)}px solid ${OG_COLORS.white}`,
                  overflow: 'hidden',
                  display: 'flex',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                  backgroundColor: '#111',
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
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${Math.round(12 * s)}px`,
              padding: `${Math.round(14 * s)}px ${Math.round(28 * s)}px`,
              borderRadius: `${Math.round(14 * s)}px`,
              background: `linear-gradient(135deg, ${OG_COLORS.accentOrange}, ${OG_COLORS.accentOrangeDeep})`,
              color: OG_COLORS.white,
              fontSize: `${Math.round(24 * s)}px`,
              fontWeight: 800,
              letterSpacing: '0.04em',
              boxShadow: '0 12px 28px rgba(255,122,0,0.40)',
            }}
          >
            <span>APPLY NOW</span>
            <span>→</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          marginLeft: `${stripW + Math.round(14 * s)}px`,
          marginRight: `${Math.round(14 * s)}px`,
          marginBottom: `${Math.round(14 * s)}px`,
        }}
      >
        <BrandFooterBar
          brandLogoSrc={data.brandLogoSrc}
          s={s}
          height={footerH}
          qrCodeSrc={data.qrCodeSrc}
        />
      </div>
    </div>
  );
}
