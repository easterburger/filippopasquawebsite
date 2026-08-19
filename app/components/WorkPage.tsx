import BubbleMenu from "./BubbleMenu";
import WorkTapeHero from "./WorkTapeHero";
import { portfolioMenuItems } from "./portfolio-menu";

export default function WorkPage() {
  return (
    <main className="work-page">
      <BubbleMenu
        items={portfolioMenuItems}
        menuAriaLabel="Toggle portfolio navigation"
        menuBg="#f1efe6"
        menuContentColor="#181b20"
        useFixedPosition
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.1}
        glass
      />

      <WorkTapeHero />
    </main>
  );
}
