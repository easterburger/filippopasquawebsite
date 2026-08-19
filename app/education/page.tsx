import type { Metadata } from "next";

import EducationPage from "../components/EducationPage";

export const metadata: Metadata = {
  title: "Education | Filippo Pasqua",
  description:
    "Education and academic background of Filippo Pasqua, IB student and software developer.",
};

export default function Education() {
  return <EducationPage />;
}
