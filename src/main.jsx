import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ThemeProvider } from "next-themes"

createRoot(document.getElementById("root")).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <Provider store={store}>
      <App />
    </Provider>
  </ThemeProvider>
);