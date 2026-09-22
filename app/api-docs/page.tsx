import SwaggerUIComponent from "@/components/SwaggerUI";
import { openapi } from "@/docs/openapi";

export default function ApiDocsPage() {
  return <SwaggerUIComponent spec={openapi} />;
}