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

  const onSubmitFeedback = async (data) => {
    try {
      console.log('Feedback submitted:', data);
      
      // Save feedback to database
      const { error } = await supabase
        .from('feedback')
        .insert({
          rating: data.rating,
          suggestions: data.improvement,
          user_email: signupData?.email || 'anonymous@example.com'
        });

      if (error) {
        console.error('Error saving feedback:', error);
        return;
      }

      setShowFeedbackForm(false);
      setFeedbackSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Clear signup data from session storage
      sessionStorage.removeItem('signupData');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleBackToHome = () => {
    sessionStorage.removeItem('signupData');
    navigate('/');
  };

  if (!signupData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            
            {showFeedbackForm && !feedbackSubmitted && (
              <Card className="bg-card backdrop-blur-sm border-border">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-accent/20 rounded-full w-fit">
                    <CheckCircle className="h-12 w-12 text-accent" />
                  </div>
                  <CardTitle className="text-3xl text-foreground mb-2">
                    Application Submitted Successfully!
                  </CardTitle>
                  <img
                    src="https://ixwnucfebopjqcokohhw.supabase.co/storage/v1/object/public/assets/cat.gif"
                    alt="Success Cat"
                    className="mx-auto mb-4 w-32 h-32 object-contain"
                  />
                  <CardDescription className="text-white/80 text-lg">
                    Thank you, {signupData.firstName}! Your {signupData.userType} application has been received.
                    We'll review your application and get back to you.
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
                        <SelectTrigger className="bg-white/10 border-white/20 text-white px-3 rounded-md">
                          <SelectValue placeholder="Rate your experience" />
                        </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50 w-full min-w-[var(--radix-select-trigger-width)]">
                                  <SelectItem value="5" className="text-gray-900 hover:bg-gray-100 cursor-pointer pl-4 pr-4 py-2 focus:bg-gray-100 data-[state=checked]:bg-gray-100">
                                    <span className="block">⭐⭐⭐⭐⭐ Excellent</span>
                                  </SelectItem>
                                  <SelectItem value="4" className="text-gray-900 hover:bg-gray-100 cursor-pointer pl-4 pr-4 py-2 focus:bg-gray-100 data-[state=checked]:bg-gray-100">
                                    <span className="block">⭐⭐⭐⭐ Good</span>
                                  </SelectItem>
                                  <SelectItem value="3" className="text-gray-900 hover:bg-gray-100 cursor-pointer pl-4 pr-4 py-2 focus:bg-gray-100 data-[state=checked]:bg-gray-100">
                                    <span className="block">⭐⭐⭐ Average</span>
                                  </SelectItem>
                                  <SelectItem value="2" className="text-gray-900 hover:bg-gray-100 cursor-pointer pl-4 pr-4 py-2 focus:bg-gray-100 data-[state=checked]:bg-gray-100">
                                    <span className="block">⭐⭐ Below Average</span>
                                  </SelectItem>
                                  <SelectItem value="1" className="text-gray-900 hover:bg-gray-100 cursor-pointer pl-4 pr-4 py-2 focus:bg-gray-100 data-[state=checked]:bg-gray-100">
                                    <span className="block">⭐ Poor</span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 px-3 py-2 resize-none rounded-md"
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
                            className="flex-1 flex items-center"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
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
                  <img
                    src="https://ixwnucfebopjqcokohhw.supabase.co/storage/v1/object/public/assets/cat2.gif"
                    alt="Success Cat"
                    className="mx-auto mb-4 w-32 h-32 object-contain"
                  />
                  <CardDescription className="text-white/80 text-lg">
                    Your feedback helps us improve the APALSA Mentorship Program experience.
                    We appreciate you taking the time to share your thoughts.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Button
                        onClick={handleBackToHome}
                        className="bg-gold-light text-primary hover:bg-gold-dark whitespace-nowrap flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                      </Button>
                    </div>
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