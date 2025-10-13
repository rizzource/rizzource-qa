import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PollViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-8 px-3"
      >
        <Grid3X3 className="h-4 w-4 mr-1" />
        Grid
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="h-8 px-3"
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
    </div>
  );
};

export default PollViewToggle;