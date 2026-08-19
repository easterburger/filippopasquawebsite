import type { Metadata } from "next";

import ProjectsPage from "../../components/ProjectsPage";

export const metadata: Metadata = {
  title: "Projects | Filippo Pasqua",
  description:
    "Products founded and built solo by Filippo Pasqua: Dawn, Zayno and Lumostudio.",
};

export default function Projects() {
  return <ProjectsPage />;
}
