import { useState } from "react";
import { api, type Billing } from "../lib/api";
import { formatDate } from "../lib/format";
import { Button, ErrorNote, Modal } from "./ui";

// Changing the saved card goes through the payment service's billing page, which only allows it once "Allow updating payment
// methods" is switched on in the Bachs dashboard (Settings > Customer portal). Set this to true when it is.
const CARD_MANAGEMENT = false;

// The developer's own plan: what it is, when it renews or ends, how much of it is used, and the two things they can do
// (change the saved card, cancel). Shown on the Pricing page for signed-in developers.

function Meter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const ratio = limit ? used / limit : 0;
  const tone = ratio >= 1 ? "bg-danger" : ratio >= 0.8 ? "bg-warn-text" : "bg-brand";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-medium text-ink">
          {used.toLocaleString()} <span className="font-normal text-muted">/ {limit === null ? "unlimited" : limit.toLocaleString()}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={used} aria-valuemax={limit ?? undefined}>
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${limit ? Math.min(100, ratio * 100) : 0}%` }} />
      </div>
    </div>
  );
}

export function PlanPanel({ billing, onChanged }: { billing: Billing; onChanged: () => void }) {
  const plan = billing.plans.find((p) => p.id === billing.plan);
  const paid = billing.plan !== "free" && ["active", "trialing", "past_due"].includes(billing.status ?? "");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<"cancel" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCardPage = async () => {
    setBusy("portal");
    setError(null);
    try {
      window.location.assign(await api.billingPortal());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open the billing page.");
      setBusy(null);
    }
  };

  const cancel = async () => {
    setBusy("cancel");
    setError(null);
    try {
      await api.cancelSubscription();
      setConfirming(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const end = billing.currentPeriodEnd ? formatDate(billing.currentPeriodEnd) : null;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted">Your plan</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
            {plan?.name ?? billing.plan}
            {paid && billing.cancelAtPeriodEnd && (
              <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-xs font-medium text-warn-text">Ending</span>
            )}
            {paid && billing.status === "past_due" && (
              <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-medium text-danger-text">Payment failed</span>
            )}
          </p>
          {paid && end && (
            <p className="mt-1 text-sm text-muted">
              {billing.cancelAtPeriodEnd
                ? `Cancels on ${end}. You keep ${plan?.name ?? "your plan"} until then.`
                : `Renews on ${end}.`}
            </p>
          )}
          {!paid && <p className="mt-1 text-sm text-muted">Upgrade below when you need more users or apps.</p>}
        </div>

        {paid && (
          <div className="flex flex-wrap gap-2">
            {CARD_MANAGEMENT && (
              <Button variant="ghost" onClick={() => void openCardPage()} disabled={busy !== null}>
                {busy === "portal" ? "Opening…" : "Manage payment method"}
              </Button>
            )}
            {!billing.cancelAtPeriodEnd && (
              <Button variant="ghost" onClick={() => setConfirming(true)} disabled={busy !== null}>
                Cancel subscription
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Meter label="Monthly active users" used={billing.usage.monthlyActiveUsers} limit={billing.limits?.monthlyActiveUsers ?? null} />
        <Meter label="Apps" used={billing.usage.apps} limit={billing.limits?.apps ?? null} />
      </div>

      {error && !confirming && (
        <div className="mt-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {confirming && (
        <Modal title="Cancel your subscription?" onClose={() => (busy ? undefined : setConfirming(false))}>
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">
              {plan?.name ?? "Your plan"} stays active{end ? ` until ${end}` : " until the end of the period you paid for"}, and
              then your account goes back to the Free plan. You will not be charged again.
            </p>
            <p className="text-sm text-muted">
              After the Free plan starts, you cannot create apps beyond its limit. Apps and users you already have are kept.
            </p>
            {error && <ErrorNote>{error}</ErrorNote>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirming(false)} disabled={busy === "cancel"}>
                Keep my plan
              </Button>
              <Button variant="danger" onClick={() => void cancel()} disabled={busy === "cancel"}>
                {busy === "cancel" ? "Cancelling…" : "Cancel subscription"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
