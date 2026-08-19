import type { Metadata } from "next";

import WorkExperiencePage from "../../components/WorkExperiencePage";

export const metadata: Metadata = {
  title: "Work Experience | Filippo Pasqua",
  description:
    "Software and AI internships by Filippo Pasqua, including Borromeo de Silva and Pasqua Wines.",
};

export default function WorkExperience() {
  return <WorkExperiencePage />;
}
