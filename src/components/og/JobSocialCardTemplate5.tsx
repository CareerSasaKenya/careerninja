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
 * Template 5 — Soft modern circular composition.
 * Mint/green reference remapped to CareerSasa LinkedIn blue + orange.
 * Review only via `?template=5`.
 */
export function JobSocialCardTemplate5(data: OgJobCardData) {
  const { width, height } = OG_CARD_SIZES[data.size];
  const s = Math.min(width / 1200, height / 630);
  const stripW = Math.max(5, Math.round(6 * s));
  const footerH = Math.round(86 * s);
  const portrait = Math.round(318 * s);
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
        background: 'linear-gradient(145deg, #FFFFFF 0%, #EAF3FF 52%, #D6E9FB 100%)',
      }}
    >
      {/* Large soft brand circles (mint → light blue) */}
      <div
        style={{
          position: 'absolute',
          right: `${Math.round(-40 * s)}px`,
          top: `${Math.round(40 * s)}px`,
          width: `${Math.round(460 * s)}px`,
          height: `${Math.round(460 * s)}px`,
          borderRadius: '50%',
          backgroundColor: 'rgba(21,101,192,0.10)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: `${Math.round(40 * s)}px`,
          top: `${Math.round(100 * s)}px`,
          width: `${Math.round(360 * s)}px`,
          height: `${Math.round(360 * s)}px`,
          borderRadius: '50%',
          backgroundColor: 'rgba(21,101,192,0.08)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${Math.round(-120 * s)}px`,
          bottom: `${Math.round(60 * s)}px`,
          width: `${Math.round(280 * s)}px`,
          height: `${Math.round(280 * s)}px`,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,122,0,0.06)',
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
          gap: `${Math.round(16 * s)}px`,
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
              backgroundColor: OG_COLORS.primaryBlueDeep,
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
              color: '#071A3D',
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
              color: '#102A56',
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
                      borderRadius: `${Math.round(14 * s)}px`,
                      backgroundColor: 'rgba(255,255,255,0.88)',
                      border: '1px solid rgba(21,101,192,0.10)',
                      color: '#102A56',
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
            gap: `${Math.round(20 * s)}px`,
          }}
        >
          {data.personImageSrc ? (
            <div
              style={{
                width: `${portrait + Math.round(36 * s)}px`,
                height: `${portrait + Math.round(36 * s)}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: `${portrait + Math.round(48 * s)}px`,
                  height: `${portrait + Math.round(48 * s)}px`,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(21,101,192,0.14)',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: `${portrait}px`,
                  height: `${portrait}px`,
                  borderRadius: `${portrait / 2}px`,
                  border: `${Math.round(7 * s)}px solid ${OG_COLORS.white}`,
                  overflow: 'hidden',
                  display: 'flex',
                  boxShadow: '0 16px 40px rgba(13,71,161,0.22)',
                  backgroundColor: OG_COLORS.primaryBlue,
                  position: 'relative',
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
                  top: `${Math.round(48 * s)}px`,
                  right: `${Math.round(18 * s)}px`,
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
          variant="brandDark"
        />
      </div>
    </div>
  );
}
