import Image from "next/image";

export function RibbonMark({ hero = false }: { hero?: boolean }) {
  return (
    <span
      className={`ribbon-mark${hero ? " ribbon-mark--hero" : ""}`}
      aria-hidden="true"
    >
      <Image
        src="/brand/symbiochain-logo.png"
        alt=""
        width={612}
        height={408}
        priority={hero}
      />
    </span>
  );
}
