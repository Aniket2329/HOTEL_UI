import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Search,
  Trash2,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { hotelApi } from "@/lib/hotel-api";
import type { Reservation } from "@shared/hotel-api";

interface DeleteReservationsProps {
  onBack: () => void;
}

export default function DeleteReservations({
  onBack,
}: DeleteReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toString().includes(searchTerm) ||
      reservation.roomNumber.includes(searchTerm),
  );

  const handleDelete = async (reservation: Reservation) => {
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await hotelApi.deleteReservation(reservation.id);

      if (response.success) {
        setSuccess(
          `Reservation #${reservation.id} for ${reservation.guestName} has been deleted successfully.`,
        );
        await loadReservations(); // Refresh the list
      } else {
        setError(response.message || "Failed to delete reservation");
      }
    } catch (err: any) {
      setError(err.message || "Error deleting reservation");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "checked_in":
        return "bg-green-100 text-green-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">
              Loading reservations...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                Delete Reservations
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Cancel or remove reservations from the system
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-green-600">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search">Search Reservations</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, ID, or room number"
              className="pl-10"
            />
          </div>
        </div>

        {/* Warning Card */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <p className="text-orange-800">
                <strong>Warning:</strong> Deleting a reservation is permanent
                and cannot be undone. The room will be marked as available
                again.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reservations List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Reservations ({filteredReservations.length})
          </h2>

          {filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No Reservations Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm
                    ? "No reservations match your search."
                    : "No reservations available to delete."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredReservations.map((reservation) => (
                <Card
                  key={reservation.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-slate-600" />
                        <div>
                          <CardTitle className="text-lg">
                            {reservation.guestName}
                          </CardTitle>
                          <CardDescription>
                            Reservation ID: {reservation.id} • Room{" "}
                            {reservation.roomNumber}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status.replace("_", " ").toUpperCase()}
                        </Badge>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleting}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>
                                  This action cannot be undone. This will
                                  permanently delete the reservation for:
                                </p>
                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                  <p>
                                    <strong>Guest:</strong>{" "}
                                    {reservation.guestName}
                                  </p>
                                  <p>
                                    <strong>Email:</strong>{" "}
                                    {reservation.guestEmail}
                                  </p>
                                  <p>
                                    <strong>Room:</strong>{" "}
                                    {reservation.roomNumber}
                                  </p>
                                  <p>
                                    <strong>Dates:</strong>{" "}
                                    {formatDate(reservation.checkIn)} -{" "}
                                    {formatDate(reservation.checkOut)}
                                  </p>
                                  <p>
                                    <strong>Amount:</strong>{" "}
                                    {formatCurrency(reservation.totalAmount)}
                                  </p>
                                </div>
                                <p>
                                  The room will be marked as available for new
                                  bookings.
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(reservation)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleting}
                              >
                                {deleting ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Deleting...</span>
                                  </div>
                                ) : (
                                  "Delete Reservation"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Dates */}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(reservation.checkIn)} -{" "}
                            {formatDate(reservation.checkOut)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {Math.ceil(
                              (new Date(reservation.checkOut).getTime() -
                                new Date(reservation.checkIn).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            nights
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

                      {/* Room & Guests */}
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium">
                            Room {reservation.roomNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            {reservation.numberOfGuests} guest
                            {reservation.numberOfGuests > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-sm font-medium">
                            {formatCurrency(reservation.totalAmount)}
                          </p>
                          <p className="text-xs text-slate-500">Total Amount</p>
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
        </div>
      </div>
    </div>
  );
}
