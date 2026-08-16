import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./providers/AppProviders";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
