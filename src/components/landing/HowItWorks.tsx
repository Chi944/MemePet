import styles from "./landing.module.css";

type HowItWorksProps = {
  /** True once a verified registry is connected; changes the closing line only. */
  readonly connected: boolean;
};

/**
 * The core user story is an ordered sequence, so the steps are numbered.
 * Copy describes only what the app does; it claims no rewards or returns.
 */
const STEPS = [
  {
    id: "connect",
    title: "Connect a wallet",
    body: "Your wallet is your pet’s home. Connect on the configured network. No token approvals; network gas applies to transactions.",
  },
  {
    id: "adopt",
    title: "Adopt your pet",
    body: "One pet per wallet. Yours starts as a Hatchling, with no growth points yet.",
  },
  {
    id: "care",
    title: "Care once a day",
    body: "Each care adds 10 growth points to your pet, and one to the community's shared garden, which blooms at 20 confirmed care actions. Miss a day and you lose nothing.",
  },
  {
    id: "ask",
    title: "Ask Mochi",
    body: "Ask how your pet is doing. Each answer explains confirmed activity and shows the block it was read from. Explore or Practise changes how Mochi explains, never the facts or your growth.",
  },
] as const;

export function HowItWorks({ connected }: HowItWorksProps) {
  return (
    <section className={styles.steps} aria-labelledby="how-it-works">
      <div className={styles.stepsIntro}>
        <div>
          <p className="eyebrow">How it works</p>
          <h2 id="how-it-works">Small actions. Real connection.</h2>
        </div>
        <p className={styles.stepsSubhead}>Four small steps. A reason to come back every day.</p>
      </div>

      <ol className={styles.stepList}>
        {STEPS.map((step, index) => (
          <li key={step.id} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepBody}>{step.body}</p>
          </li>
        ))}
      </ol>

      <p className={styles.stepsNote}>
        {connected
          ? "Points appear only after the transaction is confirmed on chain, never before."
          : "Adopting and caring need a live contract, and none is connected in this build — so no pet can be adopted here yet."}
      </p>
    </section>
  );
}
