import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const TopPicksPanel = ({ 
  topPicks, 
  userChoices, 
  groupSize, 
  slots,
  onScrollToSlot 
}) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open for desktop
  
  // Find user's choice details
  const userChoiceSlots = userChoices.map(choiceId => 
    slots.find(s => s.slot_id === choiceId)
  ).filter(Boolean);

  const handleSlotClick = (slot) => {
    onScrollToSlot?.(slot.date, slot.start_time);
  };

  const getPercentage = (count) => {
    return groupSize > 0 ? Math.round((count / groupSize) * 100) : 0;
  };

  return (
    <div className="space-y-4">
      {/* Your Choices Display */}
      {userChoiceSlots.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Your Selections ({userChoiceSlots.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {userChoiceSlots.slice(0, 3).map(slot => (
                <div key={slot.slot_id} className="text-center p-2 bg-primary/5 rounded border border-primary/20">
                  <div className="font-medium text-sm">
                    {format(parseISO(slot.date), 'MMM d')} at {slot.start_time}
                  </div>
                </div>
              ))}
              {userChoiceSlots.length > 3 && (
                <div className="text-center text-xs text-muted-foreground">
                  +{userChoiceSlots.length - 3} more selections
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Picks - Mobile Collapsible, Desktop Always Open */}
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild className="md:pointer-events-none">
              <Button 
                variant="ghost" 
                className="w-full justify-between p-0 h-auto md:cursor-default"
              >
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-accent" />
                  Top Picks ({topPicks.length})
                </CardTitle>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform md:hidden",
                  isOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CardDescription className="text-left">
              Most popular time slots right now
            </CardDescription>
          </CardHeader>
          
          <CollapsibleContent forceMount>
            <CardContent className={cn("pt-0", !isOpen && "hidden md:block")}>
              {topPicks.length > 0 ? (
                <div className="space-y-2">
                  {topPicks.map((slot, index) => (
                    <div
                      key={slot.slot_id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSlotClick(slot)}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>

                      {/* Time Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {format(parseISO(slot.date), 'MMM d')} at {slot.start_time}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot.choice_count} {slot.choice_count === 1 ? 'choice' : 'choices'}
                        </div>
                      </div>

                      {/* Percentage */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getPercentage(slot.choice_count)}%
                        </Badge>
                        {index === 0 && (
                          <Trophy className="h-3 w-3 text-accent" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No choices made yet</p>
                  <p className="text-xs">Be the first to select your best time!</p>
                </div>
              )}

              {/* Group Stats */}
              {groupSize > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <div className="text-xs text-muted-foreground text-center">
                    {groupSize} {groupSize === 1 ? 'person has' : 'people have'} made choices
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default TopPicksPanel;