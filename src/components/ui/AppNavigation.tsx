"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Overview</Link>
      <Link href="/pet" aria-current={pathname === "/pet" ? "page" : undefined}>Your pet</Link>
      <Link href="/#community">Community</Link>
      <Link href="/help" aria-current={pathname === "/help" ? "page" : undefined}>Help</Link>
    </nav>
  );
}
