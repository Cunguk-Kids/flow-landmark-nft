import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="isolate relative max-w-[40rem] mx-auto bg-background">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
}
