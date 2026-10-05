function Card({ as: Component = "div", padding = "p-6", className = "", ...props }) {
  return (
    <Component
      className={`rounded-panel border border-border-default bg-surface shadow-card ${padding} ${className}`}
      {...props}
    />
  );
}

export default Card;
