import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@/lib/analytics";

export default function PageTracker() {
    const location = useLocation();

    useEffect(() => {
        track("PageViewed", {
            page: location.pathname,
            timestamp: Date.now(),
        });
    }, [location.pathname]);

    return null; // nothing visible
}
