import { Provider } from "react-redux"
import AppRoutes from "./routes/AppRoutes"
import { ToastProvider } from "./components/ToastProvider"
import { store } from "./store"

const App = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </Provider>
  )
}

export default App