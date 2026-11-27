import { useMatch } from "react-router-dom";
import { appsCache } from "../../lib/cache";

// Which app (if any) is open, read from the address /apps/:appSlug/:section. Shared by the sidebar (it lists that
// app's pages) and the header (its breadcrumb).
export function useCurrentApp() {
  const match = useMatch("/apps/:appSlug/*");
  const appSlug = match?.params.appSlug; // the app's name in the address, e.g. "my-app"
  const app = appSlug ? appsCache.findBySlug(appSlug) : null;
  const section = match?.params["*"]?.split("/")[0] ?? "";
  return { appSlug, app, section };
}
