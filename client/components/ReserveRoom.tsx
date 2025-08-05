import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, MapPin, DollarSign, Bed, Wifi, Tv, Car, Coffee, Star } from "lucide-react";
import { hotelApi } from "@/lib/hotel-api";
import type { Room, CreateReservationRequest } from "@shared/hotel-api";

interface ReserveRoomProps {
  onBack: () => void;
}

export default function ReserveRoom({ onBack }: ReserveRoomProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: 1
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getRooms();
      if (response.success) {
        setRooms(response.rooms.filter(room => room.status === 'available'));
      } else {
        setError("Failed to load rooms");
      }
    } catch (err) {
      setError("Error loading rooms");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? parseInt(value) || 1 : value
    }));
  };

  const calculateTotal = () => {
    if (!selectedRoom || !formData.checkIn || !formData.checkOut) return 0;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    return nights > 0 ? nights * selectedRoom.price : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const reservationData: CreateReservationRequest = {
        ...formData,
        roomId: selectedRoom.id
      };

      const response = await hotelApi.createReservation(reservationData);
      
      if (response.success) {
        setSuccess(`Reservation created successfully! Reservation ID: ${response.reservation?.id}`);
        setFormData({
          guestName: "",
          guestEmail: "",
          guestPhone: "",
          checkIn: "",
          checkOut: "",
          numberOfGuests: 1
        });
        setSelectedRoom(null);
        loadRooms(); // Refresh available rooms
      } else {
        setError(response.message || "Failed to create reservation");
      }
    } catch (err: any) {
      setError(err.message || "Error creating reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'single': return <Bed className="h-5 w-5" />;
      case 'double': return <Bed className="h-5 w-5" />;
      case 'suite': return <Star className="h-5 w-5" />;
      case 'deluxe': return <Star className="h-5 w-5" />;
      default: return <Bed className="h-5 w-5" />;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'tv': return <Tv className="h-4 w-4" />;
      case 'mini bar': return <Coffee className="h-4 w-4" />;
      case 'ac': return <Car className="h-4 w-4" />; // Using car as a placeholder for AC
      default: return <Star className="h-4 w-4" />;
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">Loading available rooms...</p>
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
                Reserve a Room
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Book a room for your guests
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
          {/* Available Rooms */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Available Rooms ({rooms.length})
            </h2>
            
            {rooms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Bed className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No Available Rooms
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    All rooms are currently occupied or under maintenance.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <Card 
                    key={room.id}
                    className={`cursor-pointer transition-all ${
                      selectedRoom?.id === room.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getRoomTypeIcon(room.type)}
                          <div>
                            <CardTitle className="text-lg">Room {room.number}</CardTitle>
                            <CardDescription className="capitalize">
                              {room.type} Room
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">${room.price}</p>
                          <p className="text-sm text-slate-500">per night</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {room.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getAmenityIcon(amenity)}
                            <span className="ml-1">{amenity}</span>
                          </Badge>
                        ))}
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reservation Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Reservation Details
            </h2>
            
            {!selectedRoom ? (
              <Card>
                <CardContent className="text-center py-16">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Select a Room
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Choose a room from the available options to start your reservation.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Book Room {selectedRoom.number}</CardTitle>
                  <CardDescription>
                    {selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)} Room - ${selectedRoom.price}/night
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
                          placeholder="John Doe"
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
                          placeholder="john@example.com"
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
                          placeholder="+1-555-0123"
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
                            min={today}
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
                            min={formData.checkIn || today}
                            required
                          />
                        </div>
                      </div>

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
                    </div>

                    {/* Pricing Summary */}
                    {formData.checkIn && formData.checkOut && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span>Room Rate:</span>
                          <span>${selectedRoom.price}/night</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Duration:</span>
                          <span>
                            {Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between items-center font-semibold text-lg">
                          <span>Total Amount:</span>
                          <span className="text-primary">${calculateTotal()}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitting || calculateTotal() <= 0}
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating Reservation...</span>
                        </div>
                      ) : (
                        `Book Room for $${calculateTotal()}`
                      )}
                    </Button>
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
