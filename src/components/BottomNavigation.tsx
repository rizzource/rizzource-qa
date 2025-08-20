import { Home, BookOpen, Users, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const BottomNavigation = () => {
  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Resources", href: "#resources", icon: BookOpen },
    { name: "Library", href: "/resources", icon: Search },
    { name: "Groups", href: "#groups", icon: Users },
    { name: "Profile", href: "#", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-border shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center space-y-1 text-xs text-muted-foreground hover:text-primary transition-colors touch-friendly"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;