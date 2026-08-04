import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reviewer/")({
  beforeLoad: () => {
    throw redirect({ to: "/reviewer/submissions" });
  },
});
