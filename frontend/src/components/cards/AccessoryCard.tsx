import type { Accessory } from '@/hooks/api/useGetAccessories';

interface AccessoryCardProps {
  accessory: Accessory;
  onClick?: () => void;
}

export default function AccessoryCard({ accessory, onClick }: AccessoryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex flex-col
        bg-rpn-card border-2 border-rpn-blue rounded-xl overflow-hidden
        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-rpn-blue)]
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* --- 1. VISUAL AREA --- */}
      <div className="relative w-full aspect-square bg-rpn-dark overflow-hidden border-b-2 border-rpn-blue">

        {/* IMAGE */}
        <img
          src={accessory.thumbnail}
          alt={accessory.name}
          className="absolute inset-0 w-full h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105 p-2"
          style={{ imageRendering: 'pixelated' }}
          loading="lazy"
        />

        {/* Overlay Gradient Halus */}
        <div className="absolute inset-0 bg-gradient-to-t from-rpn-card via-transparent to-transparent opacity-50 z-20 pointer-events-none" />
      </div>

      {/* --- 2. INFO CONTENT --- */}
      <div className="p-3 flex flex-col flex-1">

        {/* Judul & ID */}
        <div className="mb-1">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold font-sans text-xs truncate pr-2" title={accessory.name}>
              {accessory.name}
            </h3>
            <span className="text-[10px] font-mono text-rpn-muted bg-rpn-dark px-1.5 py-0.5 rounded border border-white/10">
              #{accessory.nft_id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
