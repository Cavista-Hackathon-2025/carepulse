import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Activity,
  FileText,
  Home,
  Utensils,
  ScanIcon as Scanner,
  Settings,
  ChevronLeft
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { href: '/meal-planner', label: 'Meal Planner', icon: <Utensils className="h-5 w-5" /> },
  { href: '/nutrition-tracker', label: 'Nutrition Tracker', icon: <Activity className="h-5 w-5" /> },
  { href: '/health-reports', label: 'Health Reports', icon: <FileText className="h-5 w-5" /> },
  { href: '/food-scanner', label: 'Food Scanner', icon: <Scanner className="h-5 w-5" /> },
  { href: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside className={cn(
      "relative h-screen bg-white transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b">
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                CURA.AI
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={cn(
                "h-5 w-5 transition-all",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full transition-all duration-200",
                    isCollapsed ? "justify-center px-2" : "justify-start",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700",
                    !isActive && "hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <span className="flex items-center">
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: cn(
                        "h-5 w-5",
                        !isCollapsed && "mr-3"
                      )
                    })}
                    {!isCollapsed && <span>{item.label}</span>}
                  </span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className={cn(
            "rounded-lg bg-blue-50 p-4 transition-all duration-300",
            isCollapsed ? "text-center" : "text-left"
          )}>
            {!isCollapsed && (
              <p className="text-sm text-blue-600 font-medium">
                Need help? Contact support
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;