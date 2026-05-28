type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "h-[26px] w-[26px] text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-2xl",
};

// PBT-world palettes (navy / ember / accent / slate / purple / bright-blue)
const PALETTES: { grad: string; text: string }[] = [
  { grad: "from-[#24243C] to-[#3A3A5C]", text: "text-white" },
  { grad: "from-[#FF6A3D] to-[#C13E15]", text: "text-white" },
  { grad: "from-[#F6FF54] to-[#D4DE2E]", text: "text-on-accent" },
  { grad: "from-[#5A6A6C] to-[#2E3839]", text: "text-white" },
  { grad: "from-[#A86BD4] to-[#5E2B85]", text: "text-white" },
  { grad: "from-[#306EC3] to-[#11317B]", text: "text-white" },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

interface AvatarProps {
  name: string;
  size?: Size;
  src?: string;
  className?: string;
}

const PX: Record<Size, number> = { sm: 26, md: 36, lg: 48, xl: 64 };

export function Avatar({ name, size = "md", src, className = "" }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={PX[size]}
        height={PX[size]}
        className={`shrink-0 rounded-full object-cover ${SIZES[size]} ${className}`}
      />
    );
  }
  const p = PALETTES[hash(name) % PALETTES.length];
  const initial = [...name][0] ?? "?";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${p.grad} ${p.text} ${SIZES[size]} font-sans font-bold ${className}`}
    >
      {initial}
    </span>
  );
}
