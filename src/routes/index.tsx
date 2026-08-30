import { createFileRoute } from "@tanstack/react-router";
import { InvoiceApp } from "@/components/invoice-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <InvoiceApp />;
}
