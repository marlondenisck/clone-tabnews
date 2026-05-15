import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default App;
