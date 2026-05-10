import { SiteMain } from "@/components/SiteMain";
import AccessibilityControls from "@/components/experiences/AccessibilityControls";

export const metadata = {
  title: "Accessibility",
  description: "Display preferences and navigation aids.",
};

export default function AccessibilityPage() {
  return (
    <SiteMain>
      <AccessibilityControls />
    </SiteMain>
  );
}
