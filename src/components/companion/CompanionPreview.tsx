import Link from "next/link";
import { Card } from "@/components/ui/Card";

/** YeeWei owns this development preview; it performs no network or wallet I/O. */
export function CompanionPreview() {
  return (
    <main style={{ maxWidth: "64rem", margin: "2rem auto", padding: "0 1rem" }}>
      <Card style={{ padding: "2rem" }} aria-labelledby="companion-preview-title">
        <p>UI preview — fictional data</p>
        <h1 id="companion-preview-title">Companion UI workbench</h1>
        <p>
          YeeWei will build the companion preview here using the shared fictional
          fixtures. This placeholder does not call a model, RPC or wallet.
        </p>
        <Link href="/dev/finale">Inspect the shared finale fixtures</Link>
      </Card>
    </main>
  );
}
