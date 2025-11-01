import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, MapPin, Users, CalendarDays } from 'lucide-react';
import { Typhography } from '@/components/ui/typhography';
import EmptyList from './components/EmptyList';
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Link } from '@tanstack/react-router';
import { has } from 'lodash';
import { useEventList } from '@/hooks';

export default function AdminPage() {
  // const [events, setEvents] = useState<EventForm[]>([
  //   {
  //     image: '',
  //     id: '1',
  //     title: 'Tech Conference 2025',
  //     description: 'Annual technology conference featuring latest innovations',
  //     date: undefined,
  //     time: '19:00:00',
  //     latitude: -6.2088,
  //     longitude: 106.8456,
  //     capacity: 500,
  //     registered: 342,
  //     rareNft: 50,
  //   },
  //   {
  //     image: '',
  //     id: '2',
  //     title: 'Workshop: React Fundamentals',
  //     description: 'Hands-on workshop for learning React basics',
  //     date: undefined,
  //     time: '12:00:00',
  //     latitude: -6.1751,
  //     longitude: 106.865,
  //     capacity: 100,
  //     registered: 78,
  //     rareNft: 20,
  //   },
  // ]);

  const { data: events } = useEventList();

  console.log(events, '======== events ==========');

  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleDelete = (id: number) => {
    // setEvents(events?.data.filter((evt) => evt.id !== id));
    setAlert({ type: 'success', message: `${id} Event deleted!` });
    // setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="mb-6">
          <Typhography className="text-3xl font-bold  mb-2">Event Management</Typhography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events?.data.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events?.data.reduce((sum, e) => sum + e.quota, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events?.data.reduce((sum, e) => sum + (e.edges?.participants?.length ?? 0), 0)}
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
              <Link to={`/admin/form`}>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </Link>
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
                  {events?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <EmptyList />
                      </TableCell>
                    </TableRow>
                  ) : (
                    events?.data.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.eventName}</div>
                            <div className="text-sm line-clamp-1 md:hidden mt-1">
                              {new Date(event.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center text-sm">
                            <CalendarDays className="mr-2 h-4 w-4 text-gray-400" />
                            {new Date(event.endDate).toLocaleDateString('id-ID')}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-400">
                                {event.lat.toFixed(4)}, {event.long.toFixed(4)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center text-sm">
                            <Users className="mr-2 h-4 w-4 text-gray-400" />
                            {event.edges?.participants?.length ?? 0}/{event.quota}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/form`}>
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hidden">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete and
                                    remove your data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    <Typhography>Cancel</Typhography>
                                  </AlertDialogCancel>
                                  <Button onClick={() => handleDelete(event.id)}>
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
      </div>
    </div>
  );
}
