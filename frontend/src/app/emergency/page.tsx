import { SiteMain } from "@/components/SiteMain";
import EmergencyExperience from "@/components/experiences/EmergencyExperience";

export const metadata = {
  title: "Emergency",
  description: "Alert-first layout with next-step guidance.",
};

export default function EmergencyPage() {
  return (
    <SiteMain>
      <EmergencyExperience />
    </SiteMain>
  );
}
