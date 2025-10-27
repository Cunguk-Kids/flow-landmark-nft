import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Toaster position="top-center" expand richColors />
      <Header />

      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
