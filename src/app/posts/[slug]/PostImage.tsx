import Image from "next/image";

const R2_BASE = process.env.NEXT_PUBLIC_R2_BASE;

function resolveSrc(src: string) {
  if (!src) return src;
  if (/^https?:\/\//.test(src)) return src;
  if (R2_BASE && src.startsWith("/")) {
    return `${R2_BASE.replace(/\/$/, "")}${src}`;
  }
  return src;
}

export default function PostImage(props: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      alt={props.alt}
      width={props.width ?? 800}
      height={props.height ?? 600}
      unoptimized
      src={resolveSrc(props.src)}
    />
  );
}
