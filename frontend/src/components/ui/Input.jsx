import { useId } from "react";

function Input({
  label,
  id,
  icon: Icon,
  className = "",
  wrapperClassName = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint"
          />
        )}

        <input
          id={inputId}
          className={`w-full rounded-control border border-border-default bg-surface-inset ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-3 text-sm text-white outline-none transition placeholder:text-text-faint hover:border-white/[0.14] focus:border-primary/60 focus:bg-primary/5 focus:ring-4 focus:ring-primary/[0.07] ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}

export default Input;
