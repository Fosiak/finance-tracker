import { useId } from "react";

function Select({
  label,
  id,
  className = "",
  wrapperClassName = "",
  children,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={`w-full rounded-control border border-border-default bg-surface-inset px-4 py-3 text-sm text-white outline-none transition hover:border-white/[0.14] focus:border-primary/60 focus:bg-primary/5 focus:ring-4 focus:ring-primary/[0.07] ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export default Select;
