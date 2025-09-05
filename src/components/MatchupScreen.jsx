import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const MatchupScreen = ({ 
  mentorName = "Sher Khan", 
  meetupTime = "3pm, Tuesday 12th Sep, 2025",
  activity = "coffee"
}) => {
  const handleDocumentClick = () => {
    // This would link to the general document when implemented
    console.log("Opening general document");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-6">
          <CardTitle className="text-2xl font-bold text-foreground">
            You're matched with {mentorName}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Time of meetup:
              </h3>
              <p className="text-muted-foreground">
                {meetupTime}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Activity of meetup:
              </h3>
              <p className="text-muted-foreground capitalize">
                {activity}
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={handleDocumentClick}
              className="w-full flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              General document (expectations of mentors and mentees)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchupScreen;