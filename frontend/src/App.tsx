import { DialogProvider } from "@/components/dialogs/DialogProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import OrderNewPage from "@/pages/OrderNewPage";
import OrderListPage from "@/pages/OrderListPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import ProductsPage from "@/pages/ProductsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders/new" element={<OrderNewPage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DialogProvider>
    </QueryClientProvider>
  );
}