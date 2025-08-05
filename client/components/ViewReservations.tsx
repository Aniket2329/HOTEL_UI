import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, MapPin, DollarSign, Phone, Mail } from "lucide-react";
import { hotelApi } from "@/lib/hotel-api";
import type { Reservation } from "@shared/hotel-api";

interface ViewReservationsProps {
  onBack: () => void;
}

export default function ViewReservations({ onBack }: ViewReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getReservations();
      if (response.success) {
        setReservations(response.reservations);
      } else {
        setError("Failed to load reservations");
      }
    } catch (err) {
      setError("Error loading reservations");
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">Loading reservations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                View Reservations
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage all hotel reservations
              </p>
            </div>
          </div>
          <Button onClick={loadReservations}>
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Reservations Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                There are currently no reservations in the system.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-slate-600" />
                      <div>
                        <CardTitle className="text-lg">{reservation.guestName}</CardTitle>
                        <CardDescription>
                          Reservation ID: {reservation.id.slice(-8)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Room Info */}
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">Room {reservation.roomNumber}</p>
                        <p className="text-xs text-slate-500">Room ID: {reservation.roomId.slice(-8)}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <p className="text-sm">{reservation.guestEmail}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <p className="text-sm">{reservation.guestPhone}</p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">${reservation.totalAmount}</p>
                        <p className="text-xs text-slate-500">
                          {reservation.numberOfGuests} guest{reservation.numberOfGuests > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 pt-4 border-t text-xs text-slate-400 flex justify-between">
                    <span>Created: {formatDate(reservation.createdAt)}</span>
                    <span>Updated: {formatDate(reservation.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {reservations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{reservations.length}</p>
                  <p className="text-sm text-slate-500">Total Reservations</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {reservations.filter(r => r.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-slate-500">Confirmed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {reservations.filter(r => r.status === 'checked_in').length}
                  </p>
                  <p className="text-sm text-slate-500">Checked In</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    ${reservations.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
