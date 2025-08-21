import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFeedback } from "@/services/feedbackService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const FeedbackForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    user_email: "",
    application_experience: "",
    experience_rating: "",
    liked_about_process: "",
    thoughts: "",
    suggestions: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const email = searchParams.get('email');
    const type = searchParams.get('type');
    
    if (email) {
      setFormData(prev => ({ ...prev, user_email: email }));
    }
    
    // If no email is provided, redirect to home
    if (!email) {
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createFeedback(formData);
      
      if (result.success) {
        toast({
          title: "Thank You!",
          description: "Your feedback has been submitted successfully.",
        });
        // Navigate to thank you page
        navigate('/thank-you');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Application Feedback</CardTitle>
            <CardDescription>
              Help us improve our application process by sharing your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="application_experience">How was your overall application experience? *</Label>
                <Textarea
                  id="application_experience"
                  value={formData.application_experience}
                  onChange={(e) => handleInputChange("application_experience", e.target.value)}
                  placeholder="Please describe your experience completing the application..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_rating">Rate your experience *</Label>
                <Select onValueChange={(value) => handleInputChange("experience_rating", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="liked_about_process">What did you like about the application process?</Label>
                <Textarea
                  id="liked_about_process"
                  value={formData.liked_about_process}
                  onChange={(e) => handleInputChange("liked_about_process", e.target.value)}
                  placeholder="Tell us what worked well for you..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thoughts">Any additional thoughts about the mentorship program?</Label>
                <Textarea
                  id="thoughts"
                  value={formData.thoughts}
                  onChange={(e) => handleInputChange("thoughts", e.target.value)}
                  placeholder="Share your thoughts about the program itself..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestions">Suggestions for improvement</Label>
                <Textarea
                  id="suggestions"
                  value={formData.suggestions}
                  onChange={(e) => handleInputChange("suggestions", e.target.value)}
                  placeholder="How can we make the application process better?"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Feedback...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackForm;