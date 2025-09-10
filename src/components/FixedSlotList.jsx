import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const FixedSlotList = ({ slots, userVotes, onVote }) => {
  const getVoteButtonVariant = (slotId, choice) => {
    const userChoice = userVotes[slotId];
    if (userChoice === choice) {
      return choice === 'yes' ? 'default' : choice === 'maybe' ? 'secondary' : 'destructive';
    }
    return 'outline';
  };

  const formatSlotTime = (slot) => {
    const date = format(parseISO(slot.date), 'MMM dd');
    return `${date}, ${slot.start_time}-${slot.end_time}`;
  };

  const handleVote = (slotId) => {
    onVote(slotId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Slots List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Time Slots
            </CardTitle>
            <CardDescription>
              Tap YES/MAYBE/NO for each slot. Results update in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div key={slot.slot_id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Slot Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatSlotTime(slot)}
                        </span>
                        {index === 0 && (
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            <Trophy className="h-3 w-3 mr-1" />
                            Top Pick
                          </Badge>
                        )}
                      </div>
                      
                      {/* Vote counts */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span>✅</span>
                          <span className="text-muted-foreground">{slot.yes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🤔</span>
                          <span className="text-muted-foreground">{slot.maybe_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>❌</span>
                          <span className="text-muted-foreground">{slot.no_count}</span>
                        </div>
                        <div className="ml-auto">
                          <Badge variant="secondary">
                            Score: {slot.score}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Vote buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={getVoteButtonVariant(slot.slot_id, 'yes')}
                        onClick={() => handleVote(slot.slot_id)}
                        className="min-w-16"
                      >
                        YES
                      </Button>
                      <Button
                        size="sm"
                        variant={getVoteButtonVariant(slot.slot_id, 'maybe')}
                        onClick={() => handleVote(slot.slot_id)}
                        className="min-w-16"
                      >
                        MAYBE
                      </Button>
                      <Button
                        size="sm"
                        variant={getVoteButtonVariant(slot.slot_id, 'no')}
                        onClick={() => handleVote(slot.slot_id)}
                        className="min-w-16"
                      >
                        NO
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pick Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Top Pick Right Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slots[0] ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-accent/10 rounded-lg border-2 border-accent/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-semibold text-lg">
                      {format(parseISO(slots[0].date), 'MMM dd')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    {slots[0].start_time} - {slots[0].end_time}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      {slots[0].score}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="text-lg">✅</div>
                      <div className="font-medium">{slots[0].yes_count}</div>
                      <div className="text-xs text-muted-foreground">Yes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg">🤔</div>
                      <div className="font-medium">{slots[0].maybe_count}</div>
                      <div className="text-xs text-muted-foreground">Maybe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg">❌</div>
                      <div className="font-medium">{slots[0].no_count}</div>
                      <div className="text-xs text-muted-foreground">No</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No votes yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FixedSlotList;