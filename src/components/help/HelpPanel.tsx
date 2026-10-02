"use client";
import { useId } from "react";
import type { HelpPanelProps } from "@/types/beta";
import { Card } from "@/components/ui/Card";
import styles from "./HelpPanel.module.css";

/** Only an absolute https URL is rendered as a link; anything else is dropped. */
function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

/** Plain text only: blank lines become paragraphs, never HTML or Markdown. */
function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

/**
 * Accessible FAQ list. Each entry is a native disclosure, so keyboard and
 * screen-reader behaviour come from the browser. Content is supplied as data.
 */
export function HelpPanel({ entries, supportUrl }: HelpPanelProps) {
  const titleId = useId();
  const supportId = useId();
  const support = safeHttpsUrl(supportUrl);

  return (
    <div className={styles.panel}>
      <Card aria-labelledby={titleId}>
        <h2 id={titleId} className={styles.title}>Frequently asked questions</h2>
        {entries.length === 0 ? (
          <p className={styles.empty}>Help answers are not available right now.</p>
        ) : (
          <ul className={styles.list}>
            {entries.map((entry) => {
              const links = (entry.links ?? [])
                .map((link) => ({ label: link.label, href: safeHttpsUrl(link.href) }))
                .filter((link): link is { label: string; href: string } => link.href !== null && link.label.trim() !== "");
              return (
                <li key={entry.id}>
                  <details className={styles.entry}>
                    <summary className={styles.question}>{entry.question}</summary>
                    <div className={styles.answer}>
                      {paragraphs(entry.answer).map((text, index) => (
                        <p key={index}>{text}</p>
                      ))}
                      {links.length > 0 ? (
                        <ul className={styles.links}>
                          {links.map((link) => (
                            <li key={link.href}>
                              <a href={link.href} target="_blank" rel="noreferrer">
                                {link.label} <span aria-hidden="true">↗</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card surface="sunken" aria-labelledby={supportId}>
        <h2 id={supportId} className={styles.title}>Support</h2>
        {support ? (
          <p className={styles.support}>
            <a href={support} target="_blank" rel="noreferrer">
              Contact MemePet support <span aria-hidden="true">↗</span>
            </a>
          </p>
        ) : (
          <p className={styles.support} role="note">
            Support contact unavailable. No monitored support contact has been verified yet, so none is listed.
          </p>
        )}
        <p className={styles.note}>
          MemePet never asks for your seed phrase, private key or a payment to help you.
        </p>
      </Card>
    </div>
  );
}
