import type { Metadata } from "next";

import ContactPage from "../components/ContactPage";

export const metadata: Metadata = {
  title: "Contact Filippo Pasqua",
  description:
    "Contact Filippo Pasqua, follow him on LinkedIn, or sign up for occasional project updates.",
};

export default function Contact() {
  return <ContactPage />;
}
