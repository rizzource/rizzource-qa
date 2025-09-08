import { useLocation } from "react-router-dom";
import MatchupScreen from "@/components/MatchupScreen";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MatchupPage = () => {
  const location = useLocation();
  const { mentorName, activity, meetupTime, location: meetupLocation } = location.state || {};

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <MatchupScreen 
          mentorName={mentorName || "Sher Khan"} 
          meetupTime={meetupTime || "3pm, Tuesday 12th Sep, 2025"}
          activity={activity || "coffee"}
          location={meetupLocation || "Campus Café"}
        />
      </main>
      <Footer />
    </div>
  );
};

export default MatchupPage;