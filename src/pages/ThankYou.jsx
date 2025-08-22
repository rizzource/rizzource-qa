import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import cat from "@/assets/cat.gif";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-hero-gradient">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-20">
        <Card className="w-full max-w-lg bg-white/10 backdrop-blur-sm border-white/20 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 bg-gold-light/20 rounded-full w-fit">
              <CheckCircle2 className="h-10 w-10 text-gold-light" />
            </div>
            <CardTitle className="text-4xl text-white">
              Thank You!
            </CardTitle>
            <CardDescription className="text-1xl text-white">
              Your feedback has been submitted successfully.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center">
            <img
              src={cat}
              alt="Cute Cat"
              className="w-32 h-32 mb-4 rounded-lg"
            />

            <Button
              onClick={() => navigate("/")}
              className="mt-2 bg-gold-light text-primary hover:bg-gold-dark flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
