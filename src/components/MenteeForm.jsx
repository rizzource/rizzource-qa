import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createMentee } from "@/services/menteeService";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const MenteeForm = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    field_of_law: "",
    hometown: "",
    undergraduate_university: "",
    hobbies: "",
    expectations: "",
    car_availability: false,
    mentorship_time_commitment: "",
    comments: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createMentee(formData);
      
      if (result.success) {
        toast({
          title: "Application Submitted Successfully!",
          description: "Thank you for applying to be a mentee.",
        });
        // Navigate to feedback form with email
        navigate(`/feedback?email=${encodeURIComponent(formData.email)}&type=mentee`);
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
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Selection
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Mentee Application</CardTitle>
            <CardDescription>
              Join our mentorship program and connect with experienced legal professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_of_law">Field of Law Interest *</Label>
                <Input
                  id="field_of_law"
                  value={formData.field_of_law}
                  onChange={(e) => handleInputChange("field_of_law", e.target.value)}
                  placeholder="e.g., Corporate Law, Criminal Law, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hometown">Hometown *</Label>
                  <Input
                    id="hometown"
                    value={formData.hometown}
                    onChange={(e) => handleInputChange("hometown", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="undergraduate_university">Undergraduate University *</Label>
                  <Input
                    id="undergraduate_university"
                    value={formData.undergraduate_university}
                    onChange={(e) => handleInputChange("undergraduate_university", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies">Hobbies & Interests</Label>
                <Textarea
                  id="hobbies"
                  value={formData.hobbies}
                  onChange={(e) => handleInputChange("hobbies", e.target.value)}
                  placeholder="Tell us about your hobbies and interests..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectations">What do you hope to gain from this mentorship? *</Label>
                <Textarea
                  id="expectations"
                  value={formData.expectations}
                  onChange={(e) => handleInputChange("expectations", e.target.value)}
                  placeholder="Describe your expectations and goals for the mentorship program..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mentorship_time_commitment">Time Commitment *</Label>
                <Select onValueChange={(value) => handleInputChange("mentorship_time_commitment", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 hours/week">1-2 hours per week</SelectItem>
                    <SelectItem value="3-4 hours/week">3-4 hours per week</SelectItem>
                    <SelectItem value="5+ hours/week">5+ hours per week</SelectItem>
                    <SelectItem value="flexible">Flexible schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="car_availability"
                  checked={formData.car_availability}
                  onCheckedChange={(checked) => handleInputChange("car_availability", checked)}
                />
                <Label htmlFor="car_availability">I have a car available for mentorship activities</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => handleInputChange("comments", e.target.value)}
                  placeholder="Anything else you'd like us to know?"
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
                    Submitting Application...
                  </>
                ) : (
                  "Submit Mentee Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenteeForm;