'use client';

/** Global animated background used on both Login and Dashboard.
 *  Renders the dark-space grid + constellation network pattern
 *  behind the page contents. Works in both dark and light theme
 *  via CSS variables defined in globals.css / login.css.
 */
export default function AppBackground() {
  return (
    <>
      {/* Base gradient layer */}
      <div className="omni-bg" aria-hidden="true" />

      {/* Dot grid */}
      <div className="omni-grid" aria-hidden="true" />

      {/* Constellation SVG pattern */}
      <svg
        className="network-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="net-pattern-global"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1.5" fill="var(--omni-node-a)" opacity="0.6" />
            <circle cx="80" cy="40" r="2"   fill="var(--omni-node-b)" opacity="0.6" />
            <circle cx="40" cy="80" r="1"   fill="var(--omni-node-c)" opacity="0.4" />
            <circle cx="90" cy="90" r="1.5" fill="var(--omni-node-a)" opacity="0.5" />
            <line x1="20" y1="20" x2="80" y2="40" stroke="var(--omni-node-a)" strokeWidth="0.5" opacity="0.3" />
            <line x1="80" y1="40" x2="40" y2="80" stroke="var(--omni-node-b)" strokeWidth="0.5" opacity="0.2" />
            <line x1="40" y1="80" x2="20" y2="20" stroke="var(--omni-node-c)" strokeWidth="0.5" opacity="0.2" />
            <line x1="80" y1="40" x2="90" y2="90" stroke="var(--omni-node-a)" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#net-pattern-global)" />
      </svg>
    </>
  );
}
