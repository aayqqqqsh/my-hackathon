export function BackgroundAmbient() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0B0F17]" aria-hidden="true">
      {/* Precision Structural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Atmospheric Exterior Sensor Aura (Top North Sky Cool Tone - static/quiet) */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.045] blur-[150px] bg-[#38BDF8]"
      />

      {/* Hearth Interior Glow (Low South Living Comfort Warm Tone - static/quiet) */}
      <div
        className="absolute -bottom-32 right-1/4 w-[650px] h-[450px] rounded-full opacity-[0.035] blur-[160px] bg-[#F59E0B]"
      />

      {/* Quiet vignette for depth */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#0B0F17]/50 to-[#0B0F17]/90 pointer-events-none" />
    </div>
  );
}
