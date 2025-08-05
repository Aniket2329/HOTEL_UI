import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Edit3, User, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { hotelApi } from "@/lib/hotel-api";
import type { Reservation, UpdateReservationRequest } from "@shared/hotel-api";

interface UpdateReservationsProps {
  onBack: () => void;
}

export default function UpdateReservations({ onBack }: UpdateReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: 1,
    status: ""
  });

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (selectedReservation) {
      setFormData({
        guestName: selectedReservation.guestName,
        guestEmail: selectedReservation.guestEmail,
        guestPhone: selectedReservation.guestPhone,
        checkIn: selectedReservation.checkIn.split('T')[0],
        checkOut: selectedReservation.checkOut.split('T')[0],
        numberOfGuests: selectedReservation.numberOfGuests,
        status: selectedReservation.status
      });
    }
  }, [selectedReservation]);

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

  const filteredReservations = reservations.filter(reservation =>
    reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.id.toString().includes(searchTerm) ||
    reservation.roomNumber.includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? parseInt(value) || 1 : value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const updates: Partial<UpdateReservationRequest> = {
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        numberOfGuests: formData.numberOfGuests,
        status: formData.status as any
      };

      const response = await hotelApi.updateReservation(selectedReservation.id, updates);
      
      if (response.success) {
        setSuccess(`Reservation ${selectedReservation.id} updated successfully!`);
        await loadReservations(); // Refresh the list
        setSelectedReservation(null); // Close the form
      } else {
        setError(response.message || "Failed to update reservation");
      }
    } catch (err: any) {
      setError(err.message || "Error updating reservation");
    } finally {
      setSubmitting(false);
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
                Update Reservations
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Modify existing reservations
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservations List */}
          <div>
            <div className="mb-4">
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
                    {searchTerm ? "No reservations match your search." : "No reservations available to update."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredReservations.map((reservation) => (
                  <Card 
                    key={reservation.id}
                    className={`cursor-pointer transition-all ${
                      selectedReservation?.id === reservation.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-600" />
                          <CardTitle className="text-base">{reservation.guestName}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription>
                        ID: {reservation.id} • Room {reservation.roomNumber}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>{formatDate(reservation.checkIn)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{formatCurrency(reservation.totalAmount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Update Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Update Reservation
            </h2>
            
            {!selectedReservation ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Edit3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Select a Reservation
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Choose a reservation from the list to start updating.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Update Reservation #{selectedReservation.id}</CardTitle>
                  <CardDescription>
                    Room {selectedReservation.roomNumber} • {formatCurrency(selectedReservation.totalAmount)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Guest Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="guestName">Guest Name *</Label>
                        <Input
                          id="guestName"
                          name="guestName"
                          type="text"
                          value={formData.guestName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="guestEmail">Email Address *</Label>
                        <Input
                          id="guestEmail"
                          name="guestEmail"
                          type="email"
                          value={formData.guestEmail}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="guestPhone">Phone Number *</Label>
                        <Input
                          id="guestPhone"
                          name="guestPhone"
                          type="tel"
                          value={formData.guestPhone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Stay Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="checkIn">Check-in Date *</Label>
                          <Input
                            id="checkIn"
                            name="checkIn"
                            type="date"
                            value={formData.checkIn}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="checkOut">Check-out Date *</Label>
                          <Input
                            id="checkOut"
                            name="checkOut"
                            type="date"
                            value={formData.checkOut}
                            onChange={handleInputChange}
                            min={formData.checkIn}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="numberOfGuests">Number of Guests</Label>
                          <Input
                            id="numberOfGuests"
                            name="numberOfGuests"
                            type="number"
                            value={formData.numberOfGuests}
                            onChange={handleInputChange}
                            min="1"
                            max="4"
                          />
                        </div>

                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="checked_in">Checked In</SelectItem>
                              <SelectItem value="checked_out">Checked Out</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={submitting}
                      >
                        {submitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Updating...</span>
                          </div>
                        ) : (
                          "Update Reservation"
                        )}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedReservation(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
