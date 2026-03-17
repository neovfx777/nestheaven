import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { realtorsApi } from '../../api/realtors';
import { toast } from 'react-hot-toast';

function pickTitle(title: any): string {
  if (!title) return 'Apartment';
  if (typeof title === 'string') {
    try {
      const parsed = JSON.parse(title);
      if (parsed && typeof parsed === 'object') {
        return parsed.en || parsed.uz || parsed.ru || 'Apartment';
      }
    } catch {
      return title;
    }
    return title;
  }
  if (typeof title === 'object') {
    return title.en || title.uz || title.ru || 'Apartment';
  }
  return 'Apartment';
}

function toIsoFromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

export default function RealtorDashboard() {
  const queryClient = useQueryClient();
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['realtor-availability'],
    queryFn: () => realtorsApi.getMyAvailability(),
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['realtor-bookings'],
    queryFn: () => realtorsApi.getMyBookings(),
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async () => {
      if (!startAt || !endAt) throw new Error('Start and end times are required');
      return realtorsApi.createAvailability(toIsoFromLocalInput(startAt), toIsoFromLocalInput(endAt));
    },
    onSuccess: async () => {
      setStartAt('');
      setEndAt('');
      await queryClient.invalidateQueries({ queryKey: ['realtor-availability'] });
      toast.success('Availability added');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add availability');
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => realtorsApi.deleteAvailability(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['realtor-availability'] });
      toast.success('Availability removed');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove availability');
    },
  });

  const upcomingBookings = useMemo(() => bookings?.bookings || [], [bookings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-100 rounded-lg">
          <Calendar className="h-6 w-6 text-teal-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Realtor Dashboard</h1>
          <p className="text-gray-600">Manage availability and view booked tours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => createAvailabilityMutation.mutate()}
            disabled={createAvailabilityMutation.isPending}
            className="w-full"
          >
            {createAvailabilityMutation.isPending ? 'Adding...' : 'Add availability'}
          </Button>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Your calendar</h3>
            {availabilityLoading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : availability?.blocks?.length ? (
              <div className="space-y-2">
                {availability.blocks.map((block) => (
                  <div key={block.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{new Date(block.startAt).toLocaleString()}</div>
                      <div className="text-gray-500">to {new Date(block.endAt).toLocaleString()}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => deleteAvailabilityMutation.mutate(block.id)}
                      disabled={deleteAvailabilityMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No availability blocks yet.</div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booked tours</h2>

          {bookingsLoading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : upcomingBookings.length ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {pickTitle(booking.apartment?.title)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(booking.startAt).toLocaleString()} – {new Date(booking.endAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {booking.user && (
                    <div className="mt-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Client:</span> {booking.user.fullName || booking.user.email}
                      </div>
                      <div className="text-gray-500">{booking.user.phone || booking.user.email}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">No booked tours in the selected range.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

