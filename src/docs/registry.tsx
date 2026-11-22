import type { ReactNode } from "react";
import { BuildWithAiPage, OverviewPage } from "./pages/start";
import { JavaScriptPage, ReactPage } from "./pages/sdk";
import { EmailPage, ExternalWalletsPage, PasskeysPage } from "./pages/signin";
import { BackupPage, NetworksPage, SigningPage, SilentSigningPage, WalletLibrariesPage } from "./pages/wallets";
import { DomainsPage, FaqPage, ReferencePage, SecurityPage } from "./pages/reference";

export type DocEntry = { slug: string; title: string; element: ReactNode };
export type DocGroup = { title: string; pages: DocEntry[] };

export const pathOf = (entry: DocEntry) => (entry.slug ? `/docs/${entry.slug}` : "/docs");

export const GROUPS: DocGroup[] = [
  {
    title: "Get started",
    pages: [
      { slug: "", title: "Overview", element: <OverviewPage /> },
      { slug: "build-with-ai", title: "Build with AI", element: <BuildWithAiPage /> },
    ],
  },
  {
    title: "Client-side SDKs",
    pages: [
      { slug: "react", title: "React", element: <ReactPage /> },
      { slug: "javascript", title: "JavaScript", element: <JavaScriptPage /> },
    ],
  },
  {
    title: "Sign-in methods",
    pages: [
      { slug: "email", title: "Email", element: <EmailPage /> },
      { slug: "passkeys", title: "Passkeys", element: <PasskeysPage /> },
      { slug: "external-wallets", title: "External wallets", element: <ExternalWalletsPage /> },
    ],
  },
  {
    title: "Wallets",
    pages: [
      { slug: "signing", title: "Signing", element: <SigningPage /> },
      { slug: "backup", title: "Back up the key", element: <BackupPage /> },
      { slug: "networks", title: "Networks", element: <NetworksPage /> },
      { slug: "silent-signing", title: "Silent signing", element: <SilentSigningPage /> },
      { slug: "wallet-libraries", title: "Wallet libraries", element: <WalletLibrariesPage /> },
    ],
  },
  {
    title: "Reference",
    pages: [
      { slug: "domains", title: "Domains", element: <DomainsPage /> },
      { slug: "reference", title: "API reference", element: <ReferencePage /> },
      { slug: "security", title: "Security", element: <SecurityPage /> },
      { slug: "faq", title: "FAQ", element: <FaqPage /> },
    ],
  },
];

export const PAGES: DocEntry[] = GROUPS.flatMap((group) => group.pages);
