import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OutlinesUpload from "@/components/outlines/OutlinesUpload";

const OutlineUploadFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentorData, setMentorData] = useState(null);

  useEffect(() => {
    // Get mentor data from session storage
    const storedData = sessionStorage.getItem("mentorFormData");
    if (storedData) {
      setMentorData(JSON.parse(storedData));
    }
  }, []);

  const handleUploadSuccess = async (outlineData) => {
    if (!mentorData) {
      toast({
        title: "Error",
        description: "Mentor information not found. Please start over.",
        variant: "destructive",
      });
      navigate("/mentorship-selection");
      return;
    }

    try {
      // First, save the mentor to the database
      const { error: mentorError } = await supabase.from('mentors').insert([{
        first_name: mentorData.firstName,
        last_name: mentorData.lastName,
        email: mentorData.email,
        class_year: mentorData.classYear,
        field_of_law: mentorData.fieldOfLaw,
        hometown: mentorData.hometown,
        undergraduate_university: mentorData.undergraduateUniversity,
        hobbies: mentorData.hobbies,
        mentorship_time_commitment: mentorData.mentorshipTimeCommitment,
        co_mentor_preference: mentorData.coMentorPreference,
        comments: mentorData.comments,
        car_availability: mentorData.carAvailability || false,
        had_uploaded_outline: true, // Set to true since they're uploading now
      }]);

      if (mentorError) {
        throw mentorError;
      }

      // Update the outline with the mentor's email
      const { error: outlineError } = await supabase
        .from('outlines')
        .update({ mentor_email: mentorData.email })
        .eq('id', outlineData.id);

      if (outlineError) {
        console.error("Error updating outline with mentor email:", outlineError);
        // Continue anyway as the main flow is complete
      }

      // Clear session storage
      sessionStorage.removeItem("mentorFormData");

      toast({
        title: "Success!",
        description: "Your mentor application and outline have been submitted successfully.",
      });

      // Navigate to matchup screen
      navigate("/matchup", { 
        state: { 
          mentorName: `${mentorData.firstName} ${mentorData.lastName}`,
          activity: "coffee",
          meetupTime: "3pm, Tuesday 12th Sep, 2025",
          location: "Campus Café"
        } 
      });

    } catch (error) {
      console.error("Error in upload flow:", error);
      toast({
        title: "Error",
        description: "There was an error completing your registration. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <OutlinesUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
};

export default OutlineUploadFlow;