import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const feedbackSchema = z.object({
  rating: z.string().min(1, "Please select a rating"),
  feedback: z.string().min(10, "Please provide at least 10 characters of feedback"),
  improvement: z.string().optional(),
});

const ThankYou = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: "",
      feedback: "",
      improvement: "",
    },
  });

  useEffect(() => {
    const data = sessionStorage.getItem('signupData');
    if (data) {
      setSignupData(JSON.parse(data));
    } else {
      // If no signup data, redirect to home
      navigate('/');
    }
  }, [navigate]);

  const onSubmitFeedback = (data) => {
    console.log('Feedback submitted:', data);
    setShowFeedbackForm(false);
    setFeedbackSubmitted(true);
    // Clear signup data from session storage
    sessionStorage.removeItem('signupData');
  };

  const handleBackToHome = () => {
    sessionStorage.removeItem('signupData');
    navigate('/');
  };

  if (!signupData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            
            {showFeedbackForm && !feedbackSubmitted && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-green-500/20 rounded-full w-fit">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                  <CardTitle className="text-3xl text-white mb-2">
                    Application Submitted Successfully!
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    Thank you, {signupData.fullName}! Your {signupData.userType} application has been received.
                    We'll review your application and get back to you within 2-3 business days.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="border-t border-white/20 pt-6 mt-6">
                    <h3 className="text-xl font-semibold text-white mb-4 text-center">
                      Help us improve! Share your feedback
                    </h3>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitFeedback)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">How was your application experience?</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Rate your experience" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                                  <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                                  <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                                  <SelectItem value="2">⭐⭐ Below Average</SelectItem>
                                  <SelectItem value="1">⭐ Poor</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="feedback"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">What did you like about the application process?</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Share your thoughts about the application process..."
                                  {...field}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="improvement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Any suggestions for improvement? (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Let us know how we can make this better..."
                                  {...field}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBackToHome}
                            className="flex-1 border-white/20 text-light-green hover:bg-light-green hover:text-white"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-gold-light text-primary hover:bg-gold-dark"
                          >
                            Submit Feedback
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            )}

            {feedbackSubmitted && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-gold-light/20 rounded-full w-fit">
                    <Star className="h-12 w-12 text-gold-light" />
                  </div>
                  <CardTitle className="text-3xl text-white mb-2">
                    Thank You for Your Feedback!
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    Your feedback helps us improve the APALSA Mentorship Program experience.
                    We appreciate you taking the time to share your thoughts.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <p className="text-white/90">
                      You'll receive a confirmation email shortly with next steps for the mentorship program.
                    </p>
                    <Button
                      onClick={handleBackToHome}
                      className="bg-gold-light text-primary hover:bg-gold-dark"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;