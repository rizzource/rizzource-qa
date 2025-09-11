import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const UserSelections = ({ 
  userChoices, 
  slots, 
  onClearAllChoices 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Find user's choice details
  const userChoiceSlots = userChoices.map(choiceId => 
    slots.find(slot => slot.slot_id === choiceId)
  ).filter(Boolean).sort((a, b) => {
    // Sort by date first, then by time
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="w-full">
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="text-left">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Your Selections ({userChoices.length})
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {userChoices.length > 0 ? 'Your preferred time slots' : 'No selections yet'}
                  </CardDescription>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          
          <CollapsibleContent forceMount>
            <CardContent className={cn("pt-0", !isOpen && "hidden md:block")}>
              {userChoiceSlots.length > 0 ? (
                <div className="space-y-3">
                  {userChoiceSlots.map((slot, index) => (
                    <div
                      key={slot.slot_id}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {format(parseISO(slot.date), 'EEE, MMM d')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {slot.start_time} - {slot.end_time}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                  
                  {userChoices.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onClearAllChoices}
                      className="w-full gap-2 mt-4"
                    >
                      <X className="h-4 w-4" />
                      Clear All Selections
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click on time slots in the grid to add your preferences</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default UserSelections;