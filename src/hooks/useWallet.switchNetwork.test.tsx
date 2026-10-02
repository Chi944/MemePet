import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useWallet } from "@/hooks/useWallet";

type Handler = (args: { method: string; params?: unknown }) => Promise<unknown>;

function installProvider(request: Handler) {
  Object.defineProperty(window, "ethereum", {
    configurable: true,
    writable: true,
    value: { request, on: () => {}, removeListener: () => {} },
  });
}

function Probe() {
  const wallet = useWallet();
  return (
    <div>
      <button onClick={() => void wallet.switchNetwork()}>switch</button>
      <span data-testid="chain">{wallet.chainId ?? ""}</span>
      <span data-testid="error">{wallet.errorMessage ?? ""}</span>
    </div>
  );
}

describe("useWallet.switchNetwork add-chain rejection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Regression: the wallet_addEthereumChain await inside the 4902 branch had no
  // catch of its own. Declining that prompt rejected out of switchNetwork, and
  // every call site invokes it as `void switchNetwork()` — an unhandled
  // rejection, with no error surfaced to the user.
  it("surfaces an error instead of rejecting when the user declines add-chain", async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (event: PromiseRejectionEvent) => {
      unhandled.push(event.reason);
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", onUnhandled);

    installProvider(async ({ method }) => {
      if (method === "wallet_switchEthereumChain") {
        throw Object.assign(new Error("Unrecognized chain ID"), { code: 4902 });
      }
      if (method === "wallet_addEthereumChain") {
        throw Object.assign(new Error("User rejected the request."), {
          code: 4001,
        });
      }
      if (method === "eth_chainId") return "0x1";
      return [];
    });

    render(<Probe />);

    // Let the mount-time wallet snapshot settle first; otherwise it resolves
    // after the click and overwrites the error state under test.
    await waitFor(() => {
      expect(screen.getByTestId("chain").textContent).toBe("1");
    });

    fireEvent.click(screen.getByRole("button", { name: "switch" }));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toMatch(/rejected|could not be added/i);
    });

    await new Promise((r) => setTimeout(r, 20));
    expect(unhandled).toHaveLength(0);

    window.removeEventListener("unhandledrejection", onUnhandled);
  });
});