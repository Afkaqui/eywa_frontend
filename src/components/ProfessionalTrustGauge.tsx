interface ProfessionalTrustGaugeProps {
  score: number;
}

export function ProfessionalTrustGauge({ score }: ProfessionalTrustGaugeProps) {
  const radius = 100;
  const strokeWidth = 2;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-64 h-64">
      <svg
        className="transform -rotate-90 w-full h-full"
        width={radius * 2}
        height={radius * 2}
      >
        {/* Outer ring - background */}
        <circle
          stroke="#E5E7EB"
          fill="none"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Middle ring with gradient - progress */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A8F5C" />
            <stop offset="100%" stopColor="#0E3B25" />
          </linearGradient>
          
          {/* Metallic shimmer effect */}
          <linearGradient id="metallicShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </linearGradient>
        </defs>
        
        <circle
          stroke="url(#gaugeGradient)"
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        
        {/* Inner decorative rings */}
        <circle
          stroke="#F3F4F6"
          fill="none"
          strokeWidth={1}
          r={normalizedRadius - 10}
          cx={radius}
          cy={radius}
        />
        
        <circle
          stroke="#E5E7EB"
          fill="none"
          strokeWidth={0.5}
          r={normalizedRadius - 15}
          cx={radius}
          cy={radius}
        />
      </svg>

      {/* Center Score Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl font-light text-gray-900 tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {score}
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-widest mt-1">TRUST</div>
        </div>
      </div>

      {/* Score indicators around the gauge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
        <div className="text-[10px] text-gray-400 font-medium">100</div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
        <div className="text-[10px] text-gray-400 font-medium">0</div>
      </div>
    </div>
  );
}
