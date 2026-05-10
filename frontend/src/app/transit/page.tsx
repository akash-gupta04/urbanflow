import { SiteMain } from "@/components/SiteMain";
import TransitExperience from "@/components/experiences/TransitExperience";

export const metadata = {
  title: "Transit",
  description:
    "Trip planning with AI suggestions and an on-page road map between your start and destination.",
};

export default function TransitPage() {
  return (
    <SiteMain>
      <TransitExperience />
    </SiteMain>
  );
}
