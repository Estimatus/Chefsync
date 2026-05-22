import { Outlet, useLocation } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"

export const Layout = () => {
    const location = useLocation();
    const hideChrome = location.pathname.startsWith("/admin") ||
                       location.pathname.startsWith("/settings") ||
                       location.pathname.startsWith("/chef") ||
                       location.pathname.startsWith("/login") ||
                       location.pathname.startsWith("/signup");

    return (
        <ScrollToTop>
            {!hideChrome && <Navbar />}
            <Outlet />
            {!hideChrome && <Footer />}
        </ScrollToTop>
    )
}