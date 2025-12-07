import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import router from "./router/router.jsx";
import "@/styles/global.scss";

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
