"use client";

interface PremiumTextProps {
  text: string;
}

export function PremiumText({ text }: PremiumTextProps) {
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => {
        if (p.startsWith('■')) {
          return (
            <h4 key={i} className="text-purple-300 font-semibold text-sm pt-1">
              {p.slice(1).trim()}
            </h4>
          );
        }
        return (
          <p key={i} className="text-purple-100 leading-relaxed text-[15px]">
            {p}
          </p>
        );
      })}
    </div>
  );
}
