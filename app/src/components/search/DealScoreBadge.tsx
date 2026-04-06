"use client";

interface DealScoreResult {
  score: number;
  label: string;
}

export function getDealScore(price: number): DealScoreResult {
  if (price < 100) return { score: 10, label: "Incredible Deal" };
  if (price < 150) return { score: 9, label: "Amazing Deal" };
  if (price < 200) return { score: 8, label: "Great Price" };
  if (price < 300) return { score: 7, label: "Good Price" };
  if (price < 400) return { score: 6, label: "Fair Price" };
  if (price < 500) return { score: 5, label: "Average" };
  if (price < 700) return { score: 4, label: "Above Average" };
  if (price < 1000) return { score: 3, label: "Pricey" };
  return { score: 2, label: "Expensive" };
}

function getScoreColor(score: number) {
  if (score >= 9) return { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30", circleBg: "bg-green-500/25" };
  if (score >= 7) return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", circleBg: "bg-emerald-500/25" };
  if (score >= 5) return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", circleBg: "bg-amber-500/25" };
  if (score >= 3) return { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30", circleBg: "bg-slate-500/25" };
  return { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", circleBg: "bg-red-500/25" };
}

function getEmoji(score: number) {
  if (score >= 9) return "\uD83D\uDD25";
  if (score >= 7) return "\u2728";
  return "";
}

interface DealScoreBadgeProps {
  price: number;
  score?: number;
  label?: string;
}

export function DealScoreBadge({ price, score: externalScore, label: externalLabel }: DealScoreBadgeProps) {
  const { score, label } = externalScore != null && externalLabel
    ? { score: externalScore, label: externalLabel }
    : getDealScore(price);
  const colors = getScoreColor(score);
  const emoji = getEmoji(score);

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
      <span className={`inline-flex items-center justify-center size-4 rounded-full text-[10px] font-bold ${colors.circleBg}`}>
        {score}
      </span>
      <span>{label}</span>
      {emoji && <span>{emoji}</span>}
    </div>
  );
}
