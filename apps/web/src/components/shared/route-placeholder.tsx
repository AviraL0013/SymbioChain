import Link from "next/link";

export function RoutePlaceholder({ title }: { title: string }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>Structure ready. Design and functionality are not implemented yet.</p>
      <nav aria-label="Project pages">
        <ul>
          <li>
            <Link href="/">Landing page</Link>
          </li>
          <li>
            <Link href="/dashboard">Mission Control</Link>
          </li>
          <li>
            <Link href="/topology">Swarm topology</Link>
          </li>
          <li>
            <Link href="/verify">TEE verifier</Link>
          </li>
          <li>
            <Link href="/nfts">NFT gallery</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
