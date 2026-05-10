import { SiteMain } from "@/components/SiteMain";
import CivicChat from "@/components/experiences/CivicChat";

export const metadata = {
  title: "Civic assistant",
  description: "Chat with the UrbanFlow assistant API.",
};

export default function CivicAssistantPage() {
  return (
    <SiteMain>
      <CivicChat />
    </SiteMain>
  );
}
