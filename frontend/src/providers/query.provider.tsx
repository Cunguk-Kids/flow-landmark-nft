import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function QueryProvider(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
