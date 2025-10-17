import { CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const JobApplicationSuccess = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card backdrop-blur-sm border-border">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-accent/20 rounded-full w-fit">
                  <CheckCircle className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-3xl text-foreground mb-2">
                  Application Submitted Successfully!
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Thank you for applying! Your application has been received.
                  The company will review your application and get back to you.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      onClick={handleBackToHome}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobApplicationSuccess;
