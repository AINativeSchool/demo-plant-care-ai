type LogoProps = {
  size?: number;
  className?: string;
};

// Logo renders the PlantCare AI mark: a stylized tree with layered foliage and trunk.
export function Logo({ size = 40, className }: LogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="20" cy="21" rx="9" ry="7" fill="var(--logo-leaf)" />
      <ellipse cx="20" cy="13" rx="6.5" ry="5.5" fill="var(--logo-leaf-light)" />
      <rect x="18.25" y="27" width="3.5" height="7" rx="1.25" fill="var(--logo-stem)" />
    </svg>
  );
}
