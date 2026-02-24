const styles = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  high: "bg-red-100 text-red-800 border-red-300",
  unknown: "bg-slate-100 text-slate-700 border-slate-300"
};

const labels = {
  en: {
    low: "Low sugar",
    medium: "Medium sugar",
    high: "High sugar",
    unknown: "Unknown"
  },
  kh: {
    low: "ស្ករតិច",
    medium: "ស្ករមធ្យម",
    high: "ស្ករខ្ពស់",
    unknown: "មិនស្គាល់"
  }
};

export default function SugarBadge({ level = "unknown", lang = "en" }) {
  const dictionary = labels[lang] || labels.en;
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[level]}`}>
      {dictionary[level] || dictionary.unknown}
    </span>
  );
}
