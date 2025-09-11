import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

const MatchupScreen = () => {
  const { userGroup } = useAuth();
  const navigate = useNavigate();

  if (!userGroup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-14 md:py-20 lg:py-28">
          <Card className="mx-auto max-w-2xl rounded-xl border border-border bg-card shadow-sm">
            <CardContent className="p-7 sm:p-9">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                  No Group Found
                </h1>
                <p className="text-muted-foreground">
                  You don't seem to be part of any mentorship group yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { members } = userGroup;
  const mentors = members.filter((m) => m.role === "Mentor");
  const mentees = members.filter((m) => m.role === "Mentee");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-14 md:py-20 lg:py-28">
        {/* Widen a bit so two columns have breathing room */}
        <Card className="mx-auto max-w-4xl rounded-xl border border-border bg-card shadow-sm">
          <CardContent className="p-7 sm:p-9">
            {/* Header: icon + title perfectly aligned */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-foreground/70" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-none">
                Your Group Members
              </h1>
            </div>

            {/* Two-column layout on md+ screens */}
            {(mentors.length > 0 || mentees.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mentors */}
                {mentors.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-3">
                      {mentors.length === 1 ? "Mentor" : "Mentors"}
                    </h2>
                    <ul className="space-y-2">
                      {mentors.map((mentor, i) => (
                        <li
                          key={`mentor-${i}`}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="font-medium text-foreground">{mentor.name}</div>
                          <div className="text-sm text-muted-foreground">{mentor.email}</div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Mentees */}
                {mentees.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-3">
                      {mentees.length === 1 ? "Mentee" : "Mentees"}
                    </h2>
                    <ul className="space-y-2">
                      {mentees.map((mentee, i) => (
                        <li
                          key={`mentee-${i}`}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="font-medium text-foreground">{mentee.name}</div>
                          <div className="text-sm text-muted-foreground">{mentee.email}</div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No other group members found.</p>
              </div>
            )}

            {/* Navigation Button */}
            <div className="flex justify-center mt-6 pt-6 border-t border-border">
              <Button 
                onClick={() => navigate('/availability')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Set Your Availability
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchupScreen;
