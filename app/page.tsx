import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "AdConsole - Amazon PPC Simulator",
  description: "Amazon PPC teaching simulator - Migrating to React",
};

export default async function Home() {
  // Redirect directly to the legacy tool
  redirect("/adconsole.html");
}
