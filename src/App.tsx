import AppRoutes from "./routes/AppRoutes"
import { ToastProvider } from "./components/ToastProvider"

const App = () => {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}

export default App