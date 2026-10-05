import { getCategory } from "../../constants/categories";

function Pill({ category, children, className = "" }) {
  if (category) {
    const meta = getCategory(category);

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${meta.pillClass} ${className}`}
      >
        {meta.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border border-border-default bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-text-muted ${className}`}
    >
      {children}
    </span>
  );
}

export default Pill;
