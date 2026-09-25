import type { BubbleMenuItem } from "./BubbleMenu";

export const portfolioMenuItems: BubbleMenuItem[] = [
  {
    label: "home",
    href: "/#home",
    ariaLabel: "Home",
    rotation: -7,
    hoverStyles: { bgColor: "#e84249", textColor: "#ffffff" },
  },
  {
    label: "about me",
    href: "/about",
    ariaLabel: "About me",
    rotation: 5,
    hoverStyles: { bgColor: "#e9b936", textColor: "#181b20" },
  },
  {
    label: "experience",
    href: "/experience",
    ariaLabel: "Experience",
    rotation: -4,
    hoverStyles: { bgColor: "#2db4ca", textColor: "#181b20" },
  },
  {
    label: "education",
    href: "/education",
    ariaLabel: "Education",
    rotation: 6,
    hoverStyles: { bgColor: "#8ec84c", textColor: "#181b20" },
  },
  {
    label: "contact",
    href: "/contact",
    ariaLabel: "Contact",
    rotation: -6,
    hoverStyles: { bgColor: "#9a77d3", textColor: "#181b20" },
  },
];
