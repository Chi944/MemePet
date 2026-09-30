import { FinaleCommunityPanel } from "@/components/community/FinaleCommunityPanel";
import type { Deployment } from "@/lib/deployment";
import type { FinaleCommunityPanelProps } from "@/types/finale-community";

/** Route-owned context: the care network and the token reference are separate. */
export function FinaleCommunitySection({ deployment, ...props }: FinaleCommunityPanelProps & {
  readonly deployment: Deployment;
}) {
  return (
    <div className="finale-community-section">
      <p className="status-note">
        Care network: {deployment.networkName ?? "Unconfigured"}
        {deployment.chainId === null ? "" : ` (chain ${deployment.chainId})`}.
        {props.identity.kind === "verified-reference" ?
          ` The ${props.identity.name} reference is on ${props.identity.networkLabel} (chain ${props.identity.chainId}). No token ownership is checked or required.` : ""}
      </p>
      <FinaleCommunityPanel {...props} />
    </div>
  );
}
