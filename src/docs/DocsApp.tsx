import { Navigate, Route, Routes } from "react-router-dom";
import DocsLayout from "./DocsLayout";
import { PAGES } from "./registry";

export default function DocsApp() {
  return (
    <Routes>
      <Route element={<DocsLayout />}>
        {PAGES.map((page) =>
          page.slug === "" ? (
            <Route key="index" index element={page.element} />
          ) : (
            <Route key={page.slug} path={page.slug} element={page.element} />
          ),
        )}
        <Route path="*" element={<Navigate to="/docs" replace />} />
      </Route>
    </Routes>
  );
}
