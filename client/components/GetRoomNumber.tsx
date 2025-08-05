import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, User, Calendar, Phone, Mail, DollarSign } from "lucide-react";
import { hotelApi } from "@/lib/hotel-api";

interface GetRoomNumberProps {
  onBack: () => void;
}

export default function GetRoomNumber({ onBack }: GetRoomNumberProps) {
  const [reservationId, setReservationId] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);

  const searchByReservationId = async () => {
    if (!reservationId.trim()) {
      setError("Please enter a reservation ID");
      return;
    }

    setLoading(true);
    setError("");
    setRoomInfo(null);

    try {
      const response = await hotelApi.getRoomByReservation(reservationId);
      if (response.success) {
        setRoomInfo(response);
      } else {
        setError("Reservation not found");
      }
    } catch (err: any) {
      setError(err.message || "Error finding reservation");
    } finally {
      setLoading(false);
    }
  };

  const searchByGuestEmail = async () => {
    if (!guestEmail.trim()) {
      setError("Please enter a guest email");
      return;
    }

    setLoading(true);
    setError("");
    setReservations([]);

    try {
      const response = await hotelApi.getReservations();
      if (response.success) {
        const guestReservations = response.reservations.filter(
          res => res.guestEmail.toLowerCase() === guestEmail.toLowerCase()
        );
        
        if (guestReservations.length > 0) {
          setReservations(guestReservations);
        } else {
          setError("No reservations found for this email address");
        }
      } else {
        setError("Error searching reservations");
      }
    } catch (err: any) {
      setError(err.message || "Error searching reservations");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setReservationId("");
    setGuestEmail("");
    setRoomInfo(null);
    setReservations([]);
    setError("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-green-100 text-green-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Get Room Number
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Find room assignments by reservation ID or guest email
              </p>
            </div>
          </div>
          {(roomInfo || reservations.length > 0) && (
            <Button variant="outline" onClick={clearSearch}>
              New Search
            </Button>
          )}
        </div>

        {/* Search Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Search by Reservation ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search by Reservation ID</span>
              </CardTitle>
              <CardDescription>
                Enter the reservation ID to find the assigned room
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reservationId">Reservation ID</Label>
                <Input
                  id="reservationId"
                  type="text"
                  value={reservationId}
                  onChange={(e) => setReservationId(e.target.value)}
                  placeholder="e.g., sample-reservation-1"
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={searchByReservationId} 
                className="w-full"
                disabled={loading || !reservationId.trim()}
              >
                {loading ? "Searching..." : "Find Room"}
              </Button>
            </CardContent>
          </Card>

          {/* Search by Guest Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search by Guest Email</span>
              </CardTitle>
              <CardDescription>
                Enter guest email to find all their reservations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.com"
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={searchByGuestEmail} 
                className="w-full"
                disabled={loading || !guestEmail.trim()}
              >
                {loading ? "Searching..." : "Find Reservations"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Room Information (Single Result) */}
        {roomInfo && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Room {roomInfo.roomNumber}</span>
                </CardTitle>
                <Badge className={getStatusColor(roomInfo.reservation.status)}>
                  {roomInfo.reservation.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <CardDescription>
                Reservation Details
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Guest Information</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {roomInfo.reservation.guestName}</p>
                    <p className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{roomInfo.reservation.guestEmail}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{roomInfo.reservation.guestPhone}</span>
                    </p>
                    <p><strong>Guests:</strong> {roomInfo.reservation.numberOfGuests}</p>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Booking Details</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Check-in:</strong> {formatDate(roomInfo.reservation.checkIn)}</p>
                    <p><strong>Check-out:</strong> {formatDate(roomInfo.reservation.checkOut)}</p>
                    <p className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span><strong>Total:</strong> {formatCurrency(roomInfo.reservation.totalAmount)}</span>
                    </p>
                    <p><strong>Reservation ID:</strong> {roomInfo.reservation.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Multiple Reservations (Email Search Results) */}
        {reservations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Found {reservations.length} Reservation{reservations.length > 1 ? 's' : ''}
            </h2>
            
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>Room {reservation.roomNumber}</span>
                      </CardTitle>
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Guest</p>
                        <p className="font-medium">{reservation.guestName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Duration</p>
                        <p className="font-medium">
                          {Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Guests</p>
                        <p className="font-medium">{reservation.numberOfGuests}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Total</p>
                        <p className="font-medium">{formatCurrency(reservation.totalAmount)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t text-xs text-slate-500">
                      <p>Reservation ID: {reservation.id}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && !roomInfo && reservations.length === 0 && (
          <Card>
            <CardContent className="text-center py-16">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Search for Room Assignments
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Use either the reservation ID or guest email to find room assignments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
