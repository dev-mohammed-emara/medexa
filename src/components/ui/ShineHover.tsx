interface ShineHoverProps {
  color: string;
}

const ShineHover = ({ color }: ShineHoverProps) => {
  return (
    <figure className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
      <span
        className="-skew-x-30 absolute left-0 top-0 h-full w-28 -translate-x-[200%] opacity-15 blur-3xl transition-transform duration-0 will-change-transform group-hover:translate-x-[400%] group-hover:duration-1500"
        style={{ background: color }}
      />
    </figure>
  );
};

export default ShineHover;
