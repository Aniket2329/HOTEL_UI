import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hotel, Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Hotel Logo */}
        <div className="bg-primary rounded-full p-4 w-16 h-16 mx-auto mb-6 shadow-lg">
          <Hotel className="h-8 w-8 text-primary-foreground mx-auto" />
        </div>

        {/* Error Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <AlertTriangle className="h-10 w-10 text-orange-600 mx-auto" />
            </div>
            <CardTitle className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              404
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
              Oops! This page seems to be unavailable
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center pb-6">
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              The page you're looking for might have been moved, deleted, or is
              temporarily unavailable.
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Hotel Management
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-6">
          If you continue to experience issues, please contact your system
          administrator.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
