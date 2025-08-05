import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import ViewReservations from "@/components/ViewReservations";
import ReserveRoom from "@/components/ReserveRoom";
import GetRoomNumber from "@/components/GetRoomNumber";
import UpdateReservations from "@/components/UpdateReservations";
import DeleteReservations from "@/components/DeleteReservations";
import {
  Hotel,
  CalendarCheck,
  Eye,
  MapPin,
  Edit,
  Trash2,
  LogOut,
  User,
  Calendar,
  Bed
} from "lucide-react";

interface HotelDashboardProps {
  onLogout: () => void;
  username: string;
}

export default function HotelDashboard({ onLogout, username }: HotelDashboardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const menuOptions = [
    {
      id: "reserve",
      title: "Reserve a Room",
      description: "Book a new room reservation",
      icon: CalendarCheck,
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      id: "view",
      title: "View Reservations",
      description: "Check all existing reservations",
      icon: Eye,
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600"
    },
    {
      id: "room-number",
      title: "Get Room Number",
      description: "Find room number for a reservation",
      icon: MapPin,
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconColor: "text-purple-600"
    },
    {
      id: "update",
      title: "Update Reservations",
      description: "Modify existing reservations",
      icon: Edit,
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconColor: "text-orange-600"
    },
    {
      id: "delete",
      title: "Delete Reservations",
      description: "Cancel or remove reservations",
      icon: Trash2,
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      iconColor: "text-red-600"
    },
    {
      id: "exit",
      title: "Exit",
      description: "Logout from the system",
      icon: LogOut,
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      iconColor: "text-gray-600"
    }
  ];

  const handleOptionClick = (optionId: string) => {
    if (optionId === "exit") {
      onLogout();
    } else {
      setSelectedOption(optionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <Hotel className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Hotel Management</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">System Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Welcome, {username}</span>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedOption ? (
          <>
            {/* Dashboard Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Hotel Management Dashboard</h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Manage your hotel operations efficiently. Select an option below to get started.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Rooms</p>
                      <p className="text-2xl font-bold">124</p>
                    </div>
                    <Bed className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Active Reservations</p>
                      <p className="text-2xl font-bold">87</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Occupancy Rate</p>
                      <p className="text-2xl font-bold">70%</p>
                    </div>
                    <Hotel className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Menu Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Card 
                    key={option.id}
                    className={`${option.color} cursor-pointer transition-all duration-200 hover:shadow-md border-2`}
                    onClick={() => handleOptionClick(option.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-white/50`}>
                          <IconComponent className={`h-6 w-6 ${option.iconColor}`} />
                        </div>
                        <CardTitle className="text-lg text-slate-800">{option.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-slate-600">
                        {option.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          /* Render functional components based on selection */
          <>
            {selectedOption === 'view' && (
              <ViewReservations onBack={() => setSelectedOption(null)} />
            )}
            {selectedOption === 'reserve' && (
              <ReserveRoom onBack={() => setSelectedOption(null)} />
            )}
            {selectedOption === 'room-number' && (
              <GetRoomNumber onBack={() => setSelectedOption(null)} />
            )}
            {(selectedOption === 'update' || selectedOption === 'delete') && (
              <div className="text-center py-16">
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle className="text-xl">Feature Coming Soon</CardTitle>
                    <CardDescription>
                      The {menuOptions.find(opt => opt.id === selectedOption)?.title} feature is being developed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setSelectedOption(null)} variant="outline">
                      Back to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
