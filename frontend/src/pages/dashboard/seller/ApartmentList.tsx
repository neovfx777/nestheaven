import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apartmentApi } from '../../../api/apartments';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { toast } from 'react-hot-toast';

export const SellerApartmentList: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: apartments, isLoading } = useQuery({
    queryKey: ['seller-apartments'],
    queryFn: () => apartmentApi.getMyListings()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apartmentApi.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      toast.success('Apartment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete apartment');
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Apartments</h2>
        <Link to="/dashboard/seller/apartments/new">
          <Button>Add New Apartment</Button>
        </Link>
      </div>

      {apartments?.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't listed any apartments yet.</p>
          <Link to="/dashboard/seller/apartments/new">
            <Button>Create Your First Listing</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartments?.map((apt) => (
            <Card key={apt.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {apt.images && apt.images.length > 0 ? (
                  <img
                    src={apt.images[0].url}
                    alt={apt.title?.uz || 'Apartment'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <Badge className="absolute top-2 right-2">
                  {apt.status}
                </Badge>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {apt.title?.uz || 'No Title'}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Price: ${apt.price?.toLocaleString()}</p>
                  <p>Rooms: {apt.rooms}</p>
                  <p>Area: {apt.area} m²</p>
                  <p>Complex: {apt.complex?.name || 'None'}</p>
                </div>

                <div className="flex justify-between mt-4">
                  <Link to={`/dashboard/seller/apartments/${apt.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Link to={`/apartments/${apt.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(apt.id)}
                    disabled={deletingId === apt.id}
                  >
                    {deletingId === apt.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};