import { SiteMain } from "@/components/SiteMain";
import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard — UrbanFlow",
  description:
    "Corridor metrics, live map, and alerts — connected to the UrbanFlow API.",
};

export default function DashboardPage() {
  return (
    <SiteMain>
      <DashboardClient />
    </SiteMain>
  );
}
