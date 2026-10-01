import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PetScene } from "@/components/pet/PetScene";
import { AppShell } from "@/components/ui/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getActiveDeployment } from "@/lib/deployment";
import {
  parsePublicWalletAddress,
  readPublicPet,
  shortenAddress,
} from "@/lib/public-pet";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const owner = parsePublicWalletAddress(address);
  if (!owner) {
    return { title: "Public pet" };
  }

  const title = `Pet of ${shortenAddress(owner)}`;
  const description =
    "A read-only look at a wallet's MemePet. Visitors cannot care for someone else's pet.";

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "MemePet",
      title: `${title} · MemePet`,
      description,
      url: `/pet/${owner}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · MemePet`,
      description,
    },
  };
}

export default async function PublicPetPage({ params }: PageProps) {
  const { address } = await params;
  const owner = parsePublicWalletAddress(address);
  if (!owner) {
    notFound();
  }

  const snapshot = await readPublicPet(owner);
  const deployment = getActiveDeployment();

  return (
    <AppShell>
      <div className="public-pet">
        <Card className="public-pet-status">
          <div className="pet-gate-head">
            <p className="eyebrow">Public pet</p>
            <Badge
              tone={
                snapshot.kind === "pet" || snapshot.kind === "no-pet"
                  ? "live"
                  : "unknown"
              }
            >
              {snapshot.kind === "pet" || snapshot.kind === "no-pet"
                ? "Read only"
                : "Not read"}
            </Badge>
          </div>
          <h1>Pet of {snapshot.ownerLabel}</h1>
          <p className="lede">
            This page reads one wallet from the registry. There is no wallet
            connection and no care action — a visitor cannot care for someone
            else&apos;s pet.
          </p>
          <p className="public-pet-address">{snapshot.owner}</p>
          <div className="pet-gate-actions">
            <Link className="link-button" href="/">
              Back to the overview
            </Link>
            <Link className="link-button link-button-quiet" href="/pet">
              Open your pet home
            </Link>
          </div>
        </Card>

        {snapshot.kind === "pet" ? (
          <PetScene
            key={`${deployment.chainId}:${deployment.registryAddress?.toLowerCase()}:${owner.toLowerCase()}`}
            pet={snapshot.pet}
            celebrate={false}
          />
        ) : null}

        {snapshot.kind === "no-pet" ? (
          <Card className="public-pet-empty">
            <h2>This wallet has not adopted a pet.</h2>
            <p>
              The registry read succeeded and reported that no pet exists for
              this address. Nothing fictional is shown in its place.
            </p>
          </Card>
        ) : null}

        {snapshot.kind === "error" ? (
          <Card className="public-pet-empty" role="alert">
            <h2>The pet could not be loaded.</h2>
            <p>{snapshot.message}</p>
          </Card>
        ) : null}

        {snapshot.kind === "unconfigured" ? (
          <Card className="public-pet-empty">
            <h2>No registry is connected.</h2>
            <p>
              A public pet can be shown only after a registry read. This build
              has no registry configured, so no pet is displayed.
            </p>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
