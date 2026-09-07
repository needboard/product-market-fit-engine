/** Inline SVG X (formerly Twitter) mark — lucide-react doesn't ship brand logos. */
export default function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={props.width ?? 14}
      height={props.height ?? 14}
      fill="currentColor"
      className={props.className}
    >
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.83-5.97 6.83H1.65l7.73-8.84L1.24 2.25h6.83l4.72 6.24 5.45-6.24zm-1.16 17.52h1.83L7.02 4.13H5.06l12.02 15.64z" />
    </svg>
  );
}
