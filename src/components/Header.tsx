import { useAuth } from "@/hooks/useAuth";
import { Bell, Menu, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAlerts } from "@/hooks/useAlerts";

export function Header() {
  const { user, signOut } = useAuth();
  const { data: alerts } = useAlerts();
  
  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <span className="text-xl font-bold text-primary-foreground">S</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg gradient-text">SilentRisk</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">AI Health Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card-elevated">
              <DropdownMenuItem disabled className="text-muted-foreground">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="sm:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
