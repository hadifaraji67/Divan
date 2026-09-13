import { createFileRoute } from "@tanstack/react-router";
import InvoiceModule from "../components/InvoiceModule";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <InvoiceModule />;
}
