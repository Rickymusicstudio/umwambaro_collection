"use client";

interface ColorSwatchProps {
  colors: string[];

  selected?: string;

  onSelect?: (color: string) => void;
}

export default function ColorSwatch({
  colors,

  selected,

  onSelect = () => {},
}: ColorSwatchProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          title={color}
          className={`
            h-10
            w-10
            rounded-full
            border-2
            transition-all

            ${
              selected === color
                ? "border-black scale-110"
                : "border-neutral-300"
            }
          `}
          style={{
            backgroundColor: color.toLowerCase(),
          }}
        />
      ))}
    </div>
  );
}