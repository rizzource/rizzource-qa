import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const MatchupScreen = () => {
  const { userGroup } = useAuth();
  
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

  const { groupMembers } = userGroup;
  const mentors = groupMembers.filter(member => member.role === 'Mentor');
  const mentees = groupMembers.filter(member => member.role === 'Mentee');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-14 md:py-20 lg:py-28">
        <Card className="mx-auto max-w-2xl rounded-xl border border-border bg-card shadow-sm">
          <CardContent className="p-7 sm:p-9">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-foreground/70" />
              </div>
           <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-6">
              Your Group Members
            </h1>
            </div>

            <div className="space-y-6">
              {/* Mentors Section */}
              {mentors.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {mentors.length === 1 ? 'Mentor' : 'Mentors'}
                  </h2>
                  <div className="space-y-2">
                    {mentors.map((mentor, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <div className="font-medium text-foreground">{mentor.name}</div>
                        <div className="text-sm text-muted-foreground">{mentor.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentees Section */}
              {mentees.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {mentees.length === 1 ? 'Mentee' : 'Mentees'}
                  </h2>
                  <div className="space-y-2">
                    {mentees.map((mentee, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-border bg-muted/30 p-4"
                      >
                        <div className="font-medium text-foreground">{mentee.name}</div>
                        <div className="text-sm text-muted-foreground">{mentee.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No members found */}
              {mentors.length === 0 && mentees.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No other group members found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchupScreen;