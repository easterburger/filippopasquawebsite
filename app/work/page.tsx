import type { Metadata } from "next";

import WorkPage from "../components/WorkPage";

export const metadata: Metadata = {
  title: "Work & Projects | Filippo Pasqua",
  description:
    "Selected products, client work and experiments built by Filippo Pasqua, IB student and software developer.",
};

export default function Work() {
  return <WorkPage />;
}
