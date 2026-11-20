import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Icon } from "../components/Icon";
import { PlanPanel } from "../components/PlanPanel";
import { Button, ErrorNote, Skeleton, SuccessNote, WarnNote } from "../components/ui";
import { api, type Billing, type PlanInfo } from "../lib/api";

type Interval = "month" | "year";

const TAGLINE: Record<string, string> = {
  free: "For trying Beacon and launching small apps.",
  pro: "For apps with a growing audience.",
  scale: "For established products.",
  enterprise: "For large teams with custom needs.",
};

const SUPPORT: Record<string, string> = {
  community: "Community support",
  email: "Email support",
  priority: "Priority support",
  dedicated: "Dedicated support",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "What counts as an active user?",
    a: "A person who signs in to one of your apps during the calendar month. Someone who signs in to three of your apps counts once, and the same person next month counts again.",
  },
  {
    q: "Is mainnet included on the Free plan?",
    a: "Yes. Every plan can use both Stellar testnet and mainnet. Plans differ in how many users and apps you have, not in what you can build.",
  },
  {
    q: "What happens if I go over my limit?",
    a: "We tell you first: you are warned in the dashboard as you approach the limit. People who already use your app can always keep signing in. Beacon only stops new sign-ups if you are far beyond your plan.",
  },
  {
    q: "How do I pay?",
    a: "By card, in US dollars, on a secure checkout page. Subscriptions renew monthly.",
  },
  {
    q: "Do you ever see my users' private keys?",
    a: "No. A wallet's key is encrypted in the user's browser, and your app never sees it. See the docs for how Beacon handles keys.",
  },
];

const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

// What each plan includes, as a list of lines.
function features(plan: PlanInfo): string[] {
  const list: string[] = [];
  const users = plan.limits.monthlyActiveUsers;
  list.push(users === null ? "Custom volume of active users" : `${users.toLocaleString()} monthly active users`);
  const apps = plan.limits.apps;
  list.push(apps === null ? "Unlimited apps" : `${apps} apps`);
  list.push("Testnet and mainnet");
  if (plan.overage) list.push(`Extra users: ${money(plan.overage.price)} per ${plan.overage.per.toLocaleString()}`);
  if (plan.removePoweredByBeacon) list.push("Remove “Powered by Beacon”");
  list.push(SUPPORT[plan.support] ?? "Support");
  return list;
}

export function Pricing() {
  const { email } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const justPaid = params.has("checkout_id"); // Bachs adds this when it sends the developer back after paying

  const [plans, setPlans] = useState<PlanInfo[] | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [interval, setInterval] = useState<Interval>("month");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .plans()
      .then(setPlans)
      .catch((e: unknown) => setLoadError(e instanceof Error ? e.message : "Could not load the plans."));
  }, []);

  // A signed-in developer sees which plan is theirs. After paying, the plan changes when the payment is confirmed,
  // which takes a moment, so ask a few times.
  const reloadBilling = () =>
    api
      .billing()
      .then(setBilling)
      .catch(() => undefined);

  useEffect(() => {
    if (!email) return setBilling(null);
    let cancelled = false;
    let tries = 0;
    const load = () =>
      api
        .billing()
        .then((b) => {
          if (cancelled) return;
          setBilling(b);
          if (justPaid && b.plan === "free" && ++tries < 8) setTimeout(load, 4000);
        })
        .catch(() => undefined); // the page works without it
    void load();
    return () => {
      cancelled = true;
    };
  }, [email, justPaid]);

  const anyYearly = useMemo(() => plans?.some((p) => p.purchasable.year) ?? false, [plans]);

  const choose = async (plan: PlanInfo) => {
    setError(null);
    if (!email) return navigate("/login", { state: { from: "/pricing" } });
    if (plan.id === "free") return navigate("/apps");
    setBusyPlan(plan.id);
    try {
      window.location.assign(await api.checkout(plan.id, interval)); // to the payment page
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the payment. Please try again.");
      setBusyPlan(null);
    }
  };

  const current = billing?.plan ?? (email ? "free" : null);

  return (
    <div className="mx-auto max-w-6xl">
      {/* ---- heading ---- */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-brand-text">Pricing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Simple pricing that grows with your app
        </h1>
        <p className="mt-3 text-base text-muted">
          Start free on testnet and mainnet. Upgrade when your users do. You only count the people who actually sign in.
        </p>

        {anyYearly && (
          <div className="mt-6 inline-flex rounded-lg border border-line bg-surface p-1 text-sm" role="group" aria-label="Billing period">
            {(["month", "year"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setInterval(value)}
                aria-pressed={interval === value}
                className={`rounded-md px-4 py-1.5 font-medium transition ${
                  interval === value ? "bg-brand text-brand-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {value === "month" ? "Monthly" : "Yearly"}
                {value === "year" && <span className="ml-1.5 text-xs opacity-80">2 months free</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- notes ---- */}
      <div className="mx-auto mt-8 max-w-3xl space-y-3 empty:hidden">
        {justPaid && (
          <SuccessNote>
            Payment received. Your plan updates in a moment{current && current !== "free" ? " and is now active" : ""}.
          </SuccessNote>
        )}
        {billing?.status === "past_due" && (
          <WarnNote>Your last payment did not go through. Your plan stays active while we try the card again.</WarnNote>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
        {loadError && <ErrorNote>{loadError}</ErrorNote>}
      </div>

      {/* ---- your plan, usage, and what you can change ---- */}
      {billing && (
        <div className="mx-auto mt-8 max-w-3xl">
          <PlanPanel billing={billing} onChanged={() => void reloadBilling()} />
        </div>
      )}

      {/* ---- plans ---- */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {!plans && !loadError && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[28rem] rounded-2xl" />)}

        {plans?.map((plan) => {
          const featured = plan.id === "pro";
          const isCurrent = current === plan.id;
          const canBuy = plan.price !== null && plan.price.monthly > 0 && plan.purchasable[interval];
          const comingSoon = !plan.launch || (plan.price !== null && plan.price.monthly > 0 && !plan.purchasable.month && !plan.purchasable.year);

          let price = "Custom";
          let per = "";
          let note = " ";
          if (plan.price) {
            if (interval === "year" && plan.price.yearly > 0) {
              price = money(Math.round((plan.price.yearly / 12) * 100) / 100);
              per = "/ month";
              note = `Billed ${money(plan.price.yearly)} a year`;
            } else {
              price = money(plan.price.monthly);
              per = plan.price.monthly > 0 ? "/ month" : "forever";
              note = plan.price.monthly > 0 ? "Billed monthly" : "No card needed";
            }
          }

          let label = "Get started";
          let disabled = false;
          if (isCurrent) (label = "Current plan"), (disabled = true);
          else if (plan.id === "free") label = email ? "Go to your apps" : "Get started";
          else if (comingSoon) (label = "Coming soon"), (disabled = true);
          else if (!canBuy) (label = interval === "year" ? "Monthly only for now" : "Coming soon"), (disabled = true);
          else label = email ? `Upgrade to ${plan.name}` : `Choose ${plan.name}`;

          return (
            <section
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-surface p-6 ${
                featured ? "border-brand shadow-lg shadow-black/5 ring-1 ring-brand" : "border-line"
              }`}
            >
              {featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-0.5 text-xs font-medium text-brand-ink">
                  Most popular
                </span>
              )}

              <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
              <p className="mt-1 min-h-10 text-sm text-muted">{TAGLINE[plan.id] ?? ""}</p>

              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-ink">{price}</span>
                <span className="text-sm text-muted">{per}</span>
              </p>
              <p className="mt-1 text-xs text-muted">{note}</p>

              <Button
                className="mt-6 w-full"
                variant={featured && !disabled ? "primary" : "ghost"}
                disabled={disabled || busyPlan !== null}
                onClick={() => void choose(plan)}
              >
                {busyPlan === plan.id ? "Opening checkout…" : label}
              </Button>

              <ul className="mt-6 space-y-3 border-t border-line pt-6 text-sm text-ink-soft">
                {features(plan).map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-text" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
        Prices are in US dollars. An active user is someone who signs in to one of your apps during the month.
        {" "}
        <Link to="/docs" className="font-medium text-brand-text hover:underline">
          Read the docs
        </Link>
      </p>

      {/* ---- questions ---- */}
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-center text-xl font-semibold tracking-tight text-ink">Questions</h2>
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink">
                {item.q}
                <Icon name="chevron" className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
