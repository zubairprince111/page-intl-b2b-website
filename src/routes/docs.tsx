import { createFileRoute } from "@tanstack/react-router";
import { ProjectReportView } from "@/components/docs/ProjectReportView";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "System Architecture & Project Report — PAGE International" },
      {
        name: "description",
        content:
          "Software engineering project report for PAGE International B2B Workshop Equipment & Procurement Platform: UML 2.5 diagrams, 16-table PostgreSQL ERD, DFD Level 0/1, security matrix & QA coverage.",
      },
      {
        property: "og:title",
        content: "PAGE International — Engineering Project Report & System Architecture",
      },
      {
        property: "og:description",
        content:
          "Interactive architectural documentation featuring all 10 UML/ERD/DFD vector diagrams, 16-table schema dictionary, and automated verification results.",
      },
    ],
  }),
  component: DocsPage,
});

export function DocsPage() {
  return <ProjectReportView />;
}

