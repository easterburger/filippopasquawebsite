import type { Metadata } from "next";

import AboutPage from "../components/AboutPage";

export const metadata: Metadata = {
  title: "About Me | Filippo Pasqua",
  description:
    "About Filippo Pasqua, an IB student and software developer from Italy.",
};

export default function About() {
  return <AboutPage />;
}
