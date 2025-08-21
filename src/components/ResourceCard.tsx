import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Star } from "lucide-react";
import { Resource } from "@/types/resource";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard = ({ resource }: ResourceCardProps) => {
  return (
    <Card className="resource-card group touch-friendly">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {resource.title}
              </h3>
            </div>
            
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base line-clamp-3">
              {resource.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs">
                {resource.category}
              </Badge>
              <Badge variant="outline" className="border-gold-primary/30 text-gold-dark text-xs">
                {resource.difficulty_level}
              </Badge>
              {resource.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-muted-foreground text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{resource.downloads}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-gold-primary text-gold-primary" />
                <span>{resource.rating}</span>
              </div>
              <span className="hidden sm:inline">By {resource.author}</span>
            </div>
          </div>
          
          <Button 
            className="w-full sm:w-auto sm:ml-4 bg-primary hover:bg-primary/90 focus-gold touch-target"
          >
            Access Resource
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;