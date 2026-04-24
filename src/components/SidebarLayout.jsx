import { useState } from "react";
import Sidebar, { COLLAPSED_W, EXPANDED_W } from "./Sidebar";

/**
 * SidebarLayout — wraps any page content with the collapsible sidebar.
 * Main content shifts right smoothly to match the sidebar width.
 *
 * Usage:
 *   <SidebarLayout>
 *     <YourPageContent />
 *   </SidebarLayout>
 */
export default function SidebarLayout({ children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onExpandChange={setExpanded} />
      <main
        style={{
          marginLeft: expanded ? EXPANDED_W : COLLAPSED_W,
          transition: "margin-left 250ms ease",
          flex: 1,
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
