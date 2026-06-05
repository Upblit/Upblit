"use client";

import { useEffect, useRef } from "react";

// SVG paths traced directly from the logo image (potrace)
// viewBox: "0 0 400 400", internal transform: translate(0,400) scale(0.1,-0.1)
const LOGO_PATHS = [
    "M1918 3499 l-48 -22 0 -1099 0 -1100 23 14 c12 9 94 57 182 107 88 51 166 100 173 109 9 12 12 165 13 681 0 366 3 682 7 702 l7 36 330 -189 330 -188 5 -324 5 -325 195 113 195 114 3 253 c3 275 -5 345 -42 394 -31 40 -39 45 -516 320 -217 125 -469 271 -559 323 -187 109 -221 118 -303 81z",
    "M1645 3341 c-44 -26 -123 -73 -176 -104 -53 -31 -99 -64 -103 -73 -3 -8 -6 -441 -6 -960 0 -519 -2 -944 -4 -944 -2 0 -68 38 -147 84 l-144 84 -5 785 -5 784 -155 -89 c-168 -96 -213 -134 -230 -197 -7 -28 -10 -257 -8 -738 3 -767 0 -724 65 -784 24 -23 994 -589 1008 -589 3 0 5 628 5 1395 0 767 -3 1395 -7 1395 -5 0 -44 -22 -88 -49z",
    "M3105 1846 c-115 -68 -419 -244 -675 -391 -256 -148 -484 -281 -507 -297 -30 -20 -45 -39 -53 -66 -11 -42 -14 -551 -2 -568 4 -6 27 -21 51 -34 78 -39 112 -29 327 97 104 61 371 215 594 343 223 128 418 245 433 259 62 57 62 53 64 434 2 266 -1 347 -10 346 -7 0 -106 -55 -222 -123z m-165 -484 c0 -62 -2 -70 -22 -79 -13 -6 -162 -92 -332 -192 -170 -99 -311 -181 -312 -181 -2 0 -4 33 -4 73 l0 73 188 107 c103 59 248 143 322 186 74 44 141 80 148 80 8 1 12 -19 12 -67z",
];

const SVG_TRANSFORM = "translate(0,400) scale(0.1,-0.1)";

export default function LogoBeamLoader() {
    const beamRefs = useRef < (SVGPathElement | null)[] > ([null, null, null]);
    const glowRefs = useRef < (SVGPathElement | null)[] > ([null, null, null]);
    const rafRef = useRef < number | null > (null);

    useEffect(() => {
        const beams = beamRefs.current.filter(Boolean) as SVGPathElement[];
        const glows = glowRefs.current.filter(Boolean) as SVGPathElement[];
        if (beams.length < 3) return;

        const lengths = beams.map((p) => p.getTotalLength());
        const totalLen = lengths.reduce((a, b) => a + b, 0);
        const beamLen = totalLen * 0.15;

        // Large gap ensures only one beam segment visible at a time
        [...beams, ...glows].forEach((p, i) => {
            const L = lengths[i % 3];
            p.style.strokeDasharray = `${beamLen} ${L * 4}`;
            p.style.strokeDashoffset = "0";
        });

        const dur = 3200;
        let start: number | null = null;

        const tick = (ts: number) => {
            if (!start) start = ts;
            const t = ((ts - start) % dur) / dur;
            const beamPos = t * totalLen;

            let remaining = beamPos;
            for (let i = 0; i < 3; i++) {
                beams[i].style.strokeDashoffset = String(-remaining);
                glows[i].style.strokeDashoffset = String(-remaining);
                remaining -= lengths[i];
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <>
            <div className="loader-root">
                <div className="halo" />

                <div className="logo-container">
                    {/* Logo shape — nearly invisible, only provides shape reference */}
                    <svg
                        className="logo-svg"
                        viewBox="0 0 400 400"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <g transform={SVG_TRANSFORM} fill="#151515" stroke="none">
                            {LOGO_PATHS.map((d, i) => (
                                <path key={i} d={d} />
                            ))}
                        </g>
                    </svg>

                    {/* Beam SVG — two passes: wide glow + sharp beam */}
                    <svg
                        className="beam-svg"
                        viewBox="0 0 400 400"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <defs>
                            <filter id="blur-soft">
                                <feGaussianBlur stdDeviation="2" />
                            </filter>
                            <filter id="blur-wide">
                                <feGaussianBlur stdDeviation="5" />
                            </filter>
                        </defs>

                        {/* Outer ambient glow */}
                        <g transform={SVG_TRANSFORM} fill="none" filter="url(#blur-wide)">
                            {LOGO_PATHS.map((d, i) => (
                                <path
                                    key={i}
                                    ref={(el) => { glowRefs.current[i] = el; }}
                                    d={d}
                                    stroke="rgba(0,225,210,0.4)"
                                    strokeWidth="35"
                                    strokeLinecap="round"
                                />
                            ))}
                        </g>

                        {/* Sharp leading beam */}
                        <g transform={SVG_TRANSFORM} fill="none" filter="url(#blur-soft)">
                            {LOGO_PATHS.map((d, i) => (
                                <path
                                    key={i}
                                    ref={(el) => { beamRefs.current[i] = el; }}
                                    d={d}
                                    stroke="rgba(80,245,230,0.95)"
                                    strokeWidth="20"
                                    strokeLinecap="round"
                                />
                            ))}
                        </g>
                    </svg>
                </div>
            </div>

            <style jsx>{`
        .loader-root {
          width: 100%;
          height: 100%;
          min-height: 200px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .halo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0, 210, 200, 0.06) 0%,
            transparent 65%
          );
          animation: halo 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes halo {
          0%,
          100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(0.97);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        .logo-container {
          position: relative;
          width: 200px;
          height: 200px;
        }

        .logo-svg,
        .beam-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 200px;
          height: 200px;
        }
      `}</style>
        </>
    );
}