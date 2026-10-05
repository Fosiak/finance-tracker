function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-control bg-white/[0.06] motion-reduce:animate-none ${className}`}
    />
  );
}

export default Skeleton;
