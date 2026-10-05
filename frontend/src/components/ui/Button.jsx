import { focusRing } from "./styles";

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "border border-border-default bg-transparent text-slate-200 hover:border-white/[0.18] hover:bg-white/[0.04]",
  ghost: "text-text-muted hover:bg-white/[0.04] hover:text-white",
  danger: "text-text-muted hover:bg-danger/10 hover:text-danger",
};

const SIZES = {
  md: "gap-2 px-4 py-2.5 text-sm font-semibold",
  sm: "gap-1.5 px-3 py-1.5 text-xs font-medium",
  icon: "h-9 w-9 p-0",
};

function Button({
  variant = "primary",
  size = "md",
  as: Component = "button",
  className = "",
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      className={`inline-flex cursor-pointer items-center justify-center rounded-control transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${focusRing} ${className}`}
      {...props}
    />
  );
}

export default Button;
