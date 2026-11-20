import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Billing } from "../lib/api";
import { WarnNote } from "./ui";

// A heads-up on the Apps page when a plan is nearly or fully used (the warning points set in pricing/plans.json: 80% and 100%).
export function UsageNotice() {
  const [billing, setBilling] = useState<Billing | null>(null);

  useEffect(() => {
    api
      .billing()
      .then(setBilling)
      .catch(() => undefined); // the page works without it
  }, []);

  if (!billing?.limits) return null;
  const name = billing.plans.find((p) => p.id === billing.plan)?.name ?? billing.plan;
  const { monthlyActiveUsers: users, apps } = billing.usage;
  const userLimit = billing.limits.monthlyActiveUsers;
  const appLimit = billing.limits.apps;

  let message: string | null = null;
  if (userLimit !== null && users >= userLimit) {
    message = `Your apps have reached the ${userLimit.toLocaleString()} monthly active users in your ${name} plan.`;
  } else if (userLimit !== null && users >= userLimit * 0.8) {
    message = `Your apps are using ${users.toLocaleString()} of the ${userLimit.toLocaleString()} monthly active users in your ${name} plan.`;
  } else if (appLimit !== null && apps >= appLimit) {
    message = `You are using all ${appLimit} apps in your ${name} plan.`;
  }
  if (!message) return null;

  return (
    <div className="mb-6">
      <WarnNote>
        {message}{" "}
        <Link to="/pricing" className="font-medium underline">
          See plans
        </Link>
      </WarnNote>
    </div>
  );
}
