import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { hotelApi } from "@/lib/hotel-api";
import {
  ArrowLeft,
  Search,
  Clock,
  Calendar,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Timer,
} from "lucide-react";

interface CheckoutTimingProps {
  onBack: () => void;
}

import { Reservation } from "@shared/hotel-api";

export default function CheckoutTiming({ onBack }: CheckoutTimingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a guest name, email, or reservation ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setReservation(null);

    try {
      const response = await hotelApi.getReservations();
      if (response.success && response.reservations) {
        // Search for reservation by guest name, email, or reservation ID
        const foundReservation = response.reservations.find((res: Reservation) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            res.guestName.toLowerCase().includes(searchLower) ||
            res.guestEmail.toLowerCase().includes(searchLower) ||
            res.id.toString() === searchTerm ||
            res.roomNumber.toLowerCase().includes(searchLower)
          );
        });

        if (foundReservation) {
          setReservation(foundReservation);
        } else {
          setError("No reservation found matching your search");
        }
      } else {
        setError("Failed to fetch reservations");
      }
    } catch (err: any) {
      setError(err.message || "Failed to search reservations");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    if (!reservation) return null;

    const checkoutTime = new Date(reservation.checkOut);
    const now = currentTime;
    const timeDiff = checkoutTime.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { expired: true, overdue: Math.abs(timeDiff) };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  };

  const timeRemaining = calculateTimeRemaining();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "checked_in":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "checked_out":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Guest Checkout Timing
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Check remaining checkout time for guests
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Guest</span>
          </CardTitle>
          <CardDescription>
            Search by guest name, email, reservation ID, or room number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Guest Information</Label>
              <Input
                id="search"
                placeholder="Enter guest name, email, reservation ID, or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {reservation && (
        <div className="space-y-6">
          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Guest Information</span>
                <Badge className={getStatusColor(reservation.status)}>
                  {reservation.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Guest Name</p>
                    <p className="text-lg font-semibold">{reservation.guest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-slate-700 dark:text-slate-300">{reservation.guest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="text-slate-700 dark:text-slate-300">{reservation.guest.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reservation ID</p>
                    <p className="text-lg font-semibold">#{reservation.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Room:</span>
                    <span className="font-semibold">{reservation.room.number} ({reservation.room.type})</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(reservation.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Timing */}
          <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <Clock className="h-5 w-5" />
                <span>Checkout Timing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Check-in Date</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <p className="text-lg font-semibold">
                        {new Date(reservation.checkIn).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Check-out Date</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <p className="text-lg font-semibold">
                        {new Date(reservation.checkOut).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Timer className="h-6 w-6 text-blue-600 mr-2" />
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Time Remaining</p>
                    </div>
                    
                    {timeRemaining && (
                      <div className="space-y-2">
                        {timeRemaining.expired ? (
                          <div className="text-center">
                            <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2 text-lg">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              CHECKOUT OVERDUE
                            </Badge>
                            <p className="text-sm text-red-600 mt-2">
                              Overdue by {Math.floor(timeRemaining.overdue / (1000 * 60 * 60))} hours and {Math.floor((timeRemaining.overdue % (1000 * 60 * 60)) / (1000 * 60))} minutes
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="grid grid-cols-4 gap-2 mb-2">
                              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border">
                                <p className="text-2xl font-bold text-blue-600">{timeRemaining.days}</p>
                                <p className="text-xs text-slate-500">Days</p>
                              </div>
                              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border">
                                <p className="text-2xl font-bold text-blue-600">{timeRemaining.hours}</p>
                                <p className="text-xs text-slate-500">Hours</p>
                              </div>
                              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border">
                                <p className="text-2xl font-bold text-blue-600">{timeRemaining.minutes}</p>
                                <p className="text-xs text-slate-500">Minutes</p>
                              </div>
                              <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border">
                                <p className="text-2xl font-bold text-blue-600">{timeRemaining.seconds}</p>
                                <p className="text-xs text-slate-500">Seconds</p>
                              </div>
                            </div>
                            {timeRemaining.days === 0 && timeRemaining.hours < 2 && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Checkout Soon
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-blue-800 dark:text-blue-200">Current Status</p>
                </div>
                <p className="text-blue-700 dark:text-blue-300">
                  Current Time: {currentTime.toLocaleString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Number of guests: {reservation.numberOfGuests}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
