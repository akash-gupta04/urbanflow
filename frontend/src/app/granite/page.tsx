import { SiteMain } from "@/components/SiteMain";
import GraniteExperience from "@/components/experiences/GraniteExperience";

export const metadata = {
  title: "Granite",
  description:
    "IBM Granite-powered urban outlook: LLM short-horizon estimates, TTM time series, and alert briefings.",
};

export default function GranitePage() {
  return (
    <SiteMain>
      <GraniteExperience />
    </SiteMain>
  );
}
