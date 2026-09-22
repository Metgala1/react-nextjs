"use client";

// swagger-ui-react@5 does not provide TypeScript declarations.
// @ts-expect-error The package's public component API is compatible with this usage.
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

type SwaggerUIComponentProps = {
  spec: Record<string, unknown>;
};

export default function SwaggerUIComponent({
  spec,
}: SwaggerUIComponentProps) {
  return <SwaggerUI spec={spec} />;
}