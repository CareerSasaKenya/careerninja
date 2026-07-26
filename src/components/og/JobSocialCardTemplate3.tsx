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
} from '@/components/og/ogShared';

/**
 * Template 3 — Dark tech circuit board + circular portrait.
 * Review only via `?template=3`. Brand colors: LinkedIn blue + orange.
 */
export function JobSocialCardTemplate3(data: OgJobCardData) {
  const { width, height } = OG_CARD_SIZES[data.size];
  const s = Math.min(width / 1200, height / 630);
  const stripW = Math.max(5, Math.round(6 * s));
  const footerH = Math.round(82 * s);
  const portrait = Math.round(330 * s);
  const titleSize = Math.round(
    (data.title.length > 36 ? 44 : data.title.length > 24 ? 54 : 62) * s,
  );
  const displayTitle = truncateWords(data.title, data.title.length > 40 ? 48 : 56);
  const chips = buildMetaChips(data, Math.round(18 * s), OG_COLORS.accentOrange, truncateWords);
  const chipRows: (typeof chips)[] = [];
  for (let i = 0; i < chips.length; i += 2) chipRows.push(chips.slice(i, i + 2));

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
        background: `linear-gradient(145deg, #061A33 0%, ${OG_COLORS.primaryBlueDeep} 48%, #0A2F66 100%)`,
      }}
    >
      {/* Circuit-board atmosphere via SVG traces */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <pattern id="t3-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path
              d="M28 0H0V28"
              fill="none"
              stroke="rgba(255,255,255,0.045)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#t3-grid)" />
        <path
          d={`M ${80 * s} ${120 * s} H ${220 * s} V ${200 * s} H ${340 * s}`}
          fill="none"
          stroke="rgba(21,101,192,0.35)"
          strokeWidth={Math.max(1, Math.round(1.5 * s))}
        />
        <path
          d={`M ${900 * s} ${80 * s} V ${180 * s} H ${1050 * s} V ${280 * s}`}
          fill="none"
          stroke="rgba(255,122,0,0.22)"
          strokeWidth={Math.max(1, Math.round(1.5 * s))}
        />
        <circle cx={220 * s} cy={120 * s} r={4 * s} fill="rgba(255,122,0,0.55)" />
        <circle cx={340 * s} cy={200 * s} r={4 * s} fill="rgba(100,181,246,0.55)" />
        <circle cx={1050 * s} cy={180 * s} r={4 * s} fill="rgba(255,122,0,0.45)" />
        <circle
          cx={1080 * s}
          cy={420 * s}
          r={160 * s}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={2 * s}
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
          padding: `${Math.round(36 * s)}px ${Math.round(40 * s)}px ${Math.round(12 * s)}px ${
            stripW + Math.round(36 * s)
          }px`,
          gap: `${Math.round(28 * s)}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: `${Math.round(620 * s)}px`,
            gap: `${Math.round(14 * s)}px`,
          }}
        >
          <CompanyLogoBox
            src={data.companyLogoSrc}
            companyName={data.companyName}
            size={Math.round(72 * s)}
          />

          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: `${Math.round(8 * s)}px`,
              padding: `${Math.round(7 * s)}px ${Math.round(14 * s)}px`,
              borderRadius: `${Math.round(999 * s)}px`,
              backgroundColor: 'rgba(21,101,192,0.45)',
              border: `1.5px solid rgba(255,255,255,0.28)`,
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
              color: OG_COLORS.white,
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              maxWidth: `${Math.round(580 * s)}px`,
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
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            {truncateWords(data.companyName, 36)}
          </div>

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
                      border: '1.5px solid rgba(100,181,246,0.28)',
                      backgroundColor: 'rgba(8,40,90,0.55)',
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
            gap: `${Math.round(22 * s)}px`,
          }}
        >
          {data.personImageSrc ? (
            <div
              style={{
                width: `${portrait + Math.round(18 * s)}px`,
                height: `${portrait + Math.round(18 * s)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${portrait}px`,
                  height: `${portrait}px`,
                  borderRadius: `${portrait / 2}px`,
                  border: `${Math.round(6 * s)}px solid ${OG_COLORS.white}`,
                  overflow: 'hidden',
                  display: 'flex',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
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
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: `${Math.round(40 * s)}px`,
                  right: `${Math.round(2 * s)}px`,
                  width: `${Math.round(22 * s)}px`,
                  height: `${Math.round(22 * s)}px`,
                  borderRadius: '50%',
                  backgroundColor: OG_COLORS.accentOrange,
                  border: `${Math.round(4 * s)}px solid ${OG_COLORS.white}`,
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
              padding: `${Math.round(16 * s)}px ${Math.round(34 * s)}px`,
              borderRadius: `${Math.round(16 * s)}px`,
              background: `linear-gradient(135deg, ${OG_COLORS.accentOrange}, ${OG_COLORS.accentOrangeDeep})`,
              color: OG_COLORS.white,
              fontSize: `${Math.round(26 * s)}px`,
              fontWeight: 800,
              letterSpacing: '0.04em',
              boxShadow: '0 12px 28px rgba(255,122,0,0.35)',
            }}
          >
            APPLY NOW →
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
        <BrandFooterBar brandLogoSrc={data.brandLogoSrc} s={s} height={footerH} />
      </div>
    </div>
  );
}
