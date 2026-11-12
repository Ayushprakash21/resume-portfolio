import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CertificationRecord, IssuerRecord } from '../../types/cms';
import { resolveCertificationLogoPipeline } from '../../services/issuerService';

export interface CertificationLogoMarkProps {
  cert: Pick<
    CertificationRecord,
    'id' | 'title' | 'issuer' | 'issuerDomain' | 'issuerLogo' | 'issuerLogoSource' | 'issuerLogoAlt' | 'highlightTag'
  >;
  cmsIssuers?: IssuerRecord[];
  variant?: 'card' | 'modal' | 'admin';
  onStatusChange?: (status: {
    renderedAs: 'image' | 'monogram';
    activeUrl: string | null;
    verified: boolean;
    failedUrls: string[];
  }) => void;
}

export const CertificationLogoMark: React.FC<CertificationLogoMarkProps> = ({
  cert,
  cmsIssuers = [],
  variant = 'card',
  onStatusChange,
}) => {
  const resolution = useMemo(
    () =>
      resolveCertificationLogoPipeline(
        {
          issuer: cert.issuer,
          issuerDomain: cert.issuerDomain,
          issuerLogo: cert.issuerLogo,
          issuerLogoSource: cert.issuerLogoSource,
          issuerLogoAlt: cert.issuerLogoAlt,
          title: cert.title,
          highlightTag: cert.highlightTag,
        },
        cmsIssuers
      ),
    [
      cert.issuer,
      cert.issuerDomain,
      cert.issuerLogo,
      cert.issuerLogoSource,
      cert.issuerLogoAlt,
      cert.title,
      cert.highlightTag,
      cmsIssuers,
    ]
  );

  const [candidateIdx, setCandidateIdx] = useState<number>(0);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'fallback'>(() =>
    resolution.candidates.length > 0 ? 'loading' : 'fallback'
  );
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const resolutionKey = `${cert.id || ''}::${resolution.candidates.map((c) => c.url).join('|')}`;

  useEffect(() => {
    setCandidateIdx(0);
    setFailedUrls([]);
    setLoadState(resolution.candidates.length > 0 ? 'loading' : 'fallback');
  }, [resolutionKey]);

  const activeCandidate =
    loadState !== 'fallback' && candidateIdx < resolution.candidates.length
      ? resolution.candidates[candidateIdx]
      : null;

  useEffect(() => {
    if (!onStatusChange) return;
    if (!activeCandidate || loadState === 'fallback') {
      onStatusChange({
        renderedAs: 'monogram',
        activeUrl: null,
        verified: false,
        failedUrls,
      });
    } else if (loadState === 'loaded') {
      onStatusChange({
        renderedAs: 'image',
        activeUrl: activeCandidate.url,
        verified: activeCandidate.verified,
        failedUrls,
      });
    }
  }, [activeCandidate?.url, activeCandidate?.verified, loadState, failedUrls.length]);

  const handleCandidateFailure = useCallback((badUrl: string) => {
    setFailedUrls((prev) => (prev.includes(badUrl) ? prev : [...prev, badUrl]));
    const nextIdx = candidateIdx + 1;
    if (nextIdx < resolution.candidates.length) {
      setCandidateIdx(nextIdx);
      setLoadState('loading');
    } else {
      setLoadState('fallback');
    }
  }, [candidateIdx, resolution.candidates.length]);

  /**
   * SVGs loaded as <img> elements may report naturalWidth === 0 on some browsers
   * because SVG is a scalable format with no intrinsic pixel dimensions when no
   * explicit width/height attributes are present. We treat this as a successful load
   * for .svg URLs; only reject if both naturalWidth AND naturalHeight are 0 for raster images.
   */
  const handleImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>, url: string) => {
    const img = e.currentTarget;
    const isSvg = url.toLowerCase().includes('.svg');
    // For SVG: even if naturalWidth is 0, we consider it loaded (it's scalable, not pixel-based).
    // For raster: reject only if both dimensions are 0 (broken/empty response).
    if (!isSvg && img.naturalWidth === 0 && img.naturalHeight === 0) {
      handleCandidateFailure(url);
    } else {
      setLoadState('loaded');
    }
  }, [handleCandidateFailure]);

  if (variant === 'admin') {
    return (
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {activeCandidate ? (
          <img
            key={activeCandidate.url}
            src={activeCandidate.url}
            alt={activeCandidate.altText}
            onLoad={(e) => handleImgLoad(e, activeCandidate.url)}
            onError={() => handleCandidateFailure(activeCandidate.url)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              opacity: loadState === 'loaded' ? 1 : 0.35,
              transition: 'opacity 0.2s ease',
            }}
          />        ) : (
          <span
            aria-label={resolution.monogram.label}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: resolution.monogram.initials.length > 2 ? '11px' : '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#D8DCE3',
            }}
          >
            {resolution.monogram.initials}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div
        style={{
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          maxWidth: '240px',
        }}
      >
        {activeCandidate ? (
          <img
            key={activeCandidate.url}
            src={activeCandidate.url}
            alt={activeCandidate.altText}
            onLoad={(e) => handleImgLoad(e, activeCandidate.url)}
            onError={() => handleCandidateFailure(activeCandidate.url)}
            style={{
              height: activeCandidate.url.toLowerCase().includes('.svg') ? '32px' : 'auto',
              maxHeight: '38px',
              maxWidth: '200px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: resolution.monogram.initials.length > 2 ? '11px' : '13px',
                fontWeight: 700,
                color: '#F4F3EE',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              {resolution.monogram.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#F4F3EE',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '185px',
                }}
              >
                {resolution.monogram.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '9.5px',
                  color: '#8E948D',
                  letterSpacing: '0.08em',
                }}
              >
                {resolution.monogram.sublabel}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: 'card' variant inside EditorialCertifications & Live Card Preview
  return (
    <div
      data-logo-mode={activeCandidate ? 'image' : 'monogram'}
      style={{
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.035)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        margin: '10px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {activeCandidate ? (
        <>
          {loadState === 'loading' && !activeCandidate.url.startsWith('/issuers/') && (
            <div
              aria-hidden="true"
              style={{
                width: '120px',
                height: '24px',
                borderRadius: '6px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)',
                position: 'absolute',
              }}
            />
          )}
          <img
            key={activeCandidate.url}
            src={activeCandidate.url}
            alt={activeCandidate.altText}
            decoding="async"
            loading="eager"
            onLoad={(e) => handleImgLoad(e, activeCandidate.url)}
            onError={() => handleCandidateFailure(activeCandidate.url)}
            style={{
              height: activeCandidate.url.toLowerCase().includes('.svg') ? '42px' : 'auto',
              maxHeight: '48px',
              maxWidth: '200px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              opacity: loadState === 'loaded' || activeCandidate.url.startsWith('/issuers/') ? 1 : 0,
              transition: 'opacity 0.25s ease',
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.75))',
            }}
          />
        </>
      ) : (
        <div
          aria-label={`${resolution.monogram.label} Monogram`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '11px',
            maxWidth: '100%',
            padding: '0 4px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background:
                'linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(167, 176, 169, 0.04) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 4px 12px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: resolution.monogram.initials.length > 2 ? '12px' : '15px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#F4F3EE',
              }}
            >
              {resolution.monogram.initials}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minWidth: 0,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: '#E5E7EB',
                lineHeight: 1.2,
                maxWidth: '175px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {resolution.monogram.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9.5px',
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: '#8E948D',
                marginTop: '3px',
              }}
            >
              {resolution.monogram.sublabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationLogoMark;
