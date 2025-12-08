import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Outlet } from "react-router-dom";
import PageTracker from "@/components/PageTracker"; 

export default function Layout() {
    return (
        <>
            {/* 🔵 Tracks page views globally */}
            <PageTracker />

            <Header />

            <main>
                <Outlet />
            </main>

            {/* <Footer /> */}
        </>
    );
}
