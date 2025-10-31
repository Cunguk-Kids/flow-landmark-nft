import React, { useState } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Users,
  ChevronDownIcon,
  CalendarDays,
} from "lucide-react";
import { Typhography } from "@/components/ui/typhography";
import EmptyList from "./components/EmptyList";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date | undefined;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  registered: number;
}

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Tech Conference 2025",
      description: "Annual technology conference featuring latest innovations",
      date: undefined,
      location: "Jakarta Convention Center",
      latitude: -6.2088,
      longitude: 106.8456,
      capacity: 500,
      registered: 342,
    },
    {
      id: "2",
      title: "Workshop: React Fundamentals",
      description: "Hands-on workshop for learning React basics",
      date: undefined,
      location: "Online",
      latitude: -6.1751,
      longitude: 106.865,
      capacity: 100,
      registered: 78,
    },
  ]);

  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    date: Date | undefined;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
  }>({
    title: "",
    description: "",
    date: undefined,
    location: "",
    latitude: -6.2088,
    longitude: 106.8456,
    capacity: 0,
  });

  const [viewState, setViewState] = useState({
    longitude: 106.8456,
    latitude: -6.2088,
    zoom: 12,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      latitude: -6.2088,
      longitude: 106.8456,
      capacity: 0,
    });
    setViewState({
      longitude: 106.8456,
      latitude: -6.2088,
      zoom: 12,
    });
    setEditingEvent(null);
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        capacity: event.capacity,
      });
      setViewState({
        longitude: event.longitude,
        latitude: event.latitude,
        zoom: 14,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    setFormData({
      ...formData,
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      setEvents(
        events.map((evt) =>
          evt.id === editingEvent.id ? { ...evt, ...formData } : evt
        )
      );
      setAlert({ type: "success", message: "Event berhasil diperbarui!" });
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
        registered: 0,
      };
      setEvents([...events, newEvent]);
      setAlert({ type: "success", message: "Event berhasil ditambahkan!" });
    }

    handleCloseDialog();
    setTimeout(() => setAlert(null), 3000);
  };

  const handleDelete = (id: string) => {
    // if (window.confirm("Apakah Anda yakin ingin menghapus event ini?")) {
    setEvents(events.filter((evt) => evt.id !== id));
    setAlert({ type: "success", message: "Event berhasil dihapus!" });
    setTimeout(() => setAlert(null), 3000);
    // }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="mb-6">
          <Typhography className="text-3xl font-bold text-gray-900 mb-2">
            Event Management
          </Typhography>
        </div>

        {/* {alert && (
          <Alert
            className={`mb-4 ${alert.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
          >
            <AlertDescription
              className={
                alert.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {alert.message}
            </AlertDescription>
          </Alert>
        )} */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + e.capacity, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Registered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + e.registered, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Events List</CardTitle>
              </div>
              <Button
                onClick={() => handleOpenDialog()}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Typhography>Event</Typhography>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <Typhography>Date</Typhography>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <Typhography>Venue</Typhography>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <Typhography>Capacity</Typhography>
                    </TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <EmptyList onClickButton={() => handleOpenDialog()} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm line-clamp-1 md:hidden mt-1">
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center text-sm">
                            <CalendarDays className="mr-2 h-4 w-4 text-gray-400" />
                            {new Date(event.date).toLocaleDateString("id-ID")}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                              <div>{event.location}</div>
                              <div className="text-xs text-gray-400">
                                {event.latitude.toFixed(4)},{" "}
                                {event.longitude.toFixed(4)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center text-sm">
                            <Users className="mr-2 h-4 w-4 text-gray-400" />
                            {event.registered}/{event.capacity}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(event)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete and remove your data from
                                    our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    <Typhography>Cancel</Typhography>
                                  </AlertDialogCancel>
                                  <Button
                                    onClick={() => handleDelete(event.id)}
                                  >
                                    <Typhography>Continue</Typhography>
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? "Update event information"
                  : "Fill out the form to add a new event"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Event title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Event Description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between font-normal"
                    >
                      {formData.date
                        ? formData.date.toLocaleDateString()
                        : "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      captionLayout="dropdown"
                      onSelect={(date: Date | undefined) => {
                        if (!date) return;
                        setFormData((prev) => ({
                          ...prev,
                          date,
                        }));
                        setOpenDatePicker(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Venue</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Example: Jakarta Convention Center"
                />
              </div>

              <div className="grid gap-2">
                <Label>Select Location on Map</Label>
                <Typhography className="text-sm mb-2">
                  Click on the map to select the event location.
                </Typhography>
                <div
                  className="border rounded-lg overflow-hidden"
                  style={{ height: "300px" }}
                >
                  <Map
                    {...viewState}
                    onMove={(evt) => setViewState(evt.viewState)}
                    onClick={handleMapClick}
                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Marker
                      longitude={formData.longitude}
                      latitude={formData.latitude}
                      anchor="bottom"
                    >
                      <MapPin
                        className="h-8 w-8 text-red-500"
                        fill="currentColor"
                      />
                    </Marker>
                  </Map>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Latitude</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          latitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-sm"
                      disabled
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Longitude</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="text-sm"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  placeholder="Capacity"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit}>
                {editingEvent ? "Update" : "Add"} Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
