import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Building,
  Home,
  Check,
  X,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { useAuthStore } from '../../../stores/authStore';

interface ComplexFilters {
  search: string;
  hasApartments: string;
  hasActiveApartments: string;
  sortBy: 'name' | 'createdAt' | 'apartmentCount';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export function ComplexList() {
  const [filters, setFilters] = useState<ComplexFilters>({
    search: '',
    hasApartments: '',
    hasActiveApartments: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  });
  const [selectedComplexes, setSelectedComplexes] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  // Backend complex format (simplified)
  interface BackendComplex {
    id: string;
    title: string | { uz?: string; ru?: string; en?: string };
    description?: string;
    address?: string | { uz?: string; ru?: string; en?: string };
    city: string;
    createdAt: string;
    _count?: {
      apartments?: number;
    };
  }

  // Fetch all complexes (public endpoint)
  const { data: complexesResponse, isLoading } = useQuery<{
    success: boolean;
    data: BackendComplex[];
  }>({
    queryKey: ['admin-complexes'],
    queryFn: async () => {
      const response = await fetch('/api/complexes');
      if (!response.ok) throw new Error('Failed to fetch complexes');
      return response.json();
    },
  });

  const complexes: BackendComplex[] = complexesResponse?.data || [];

  // Derived statistics
  const stats = useMemo(() => {
    if (!complexes.length) {
      return {
        totalComplexes: 0,
        complexesWithApartments: 0,
        complexesWithActiveApartments: 0,
        averageApartmentsPerComplex: 0,
      };
    }
    const totalComplexes = complexes.length;
    const complexesWithApartments = complexes.filter(
      (c) => (c._count?.apartments || 0) > 0
    ).length;
    const totalApartments = complexes.reduce(
      (sum, c) => sum + (c._count?.apartments || 0),
      0
    );
    return {
      totalComplexes,
      complexesWithApartments,
      complexesWithActiveApartments: complexesWithApartments,
      averageApartmentsPerComplex:
        totalComplexes > 0 ? totalApartments / totalComplexes : 0,
    };
  }, [complexes]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/complexes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete complex');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complexes'] });
      queryClient.invalidateQueries({ queryKey: ['complex-stats'] });
      setSelectedComplexes(new Set());
      setShowDeleteModal(false);
    }
  });

  const handleFilterChange = (key: keyof ComplexFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectComplex = (id: string) => {
    const newSelected = new Set(selectedComplexes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedComplexes(newSelected);
  };

  const handleSelectAll = () => {
    const ids = filteredComplexes.map((c) => c.id);
    if (selectedComplexes.size === ids.length) {
      setSelectedComplexes(new Set());
    } else {
      setSelectedComplexes(new Set(ids));
    }
  };

  const handleBulkDelete = () => {
    if (selectedComplexes.size === 0) return;

    // Check if any selected complexes have apartments
    const complexesWithApartments = filteredComplexes.filter(
      (c) => selectedComplexes.has(c.id) && (c._count?.apartments || 0) > 0
    );

    if (complexesWithApartments.length > 0) {
      alert(
        `Cannot delete ${complexesWithApartments.length} complex(es) with apartments. Remove apartments first.`
      );
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    const promises = Array.from(selectedComplexes).map((id) =>
      deleteMutation.mutateAsync(id)
    );
    await Promise.all(promises);
  };

  // Apply filters client-side
  const filteredComplexes = useMemo(() => {
    let list = [...complexes];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) => {
        const title =
          typeof c.title === 'string'
            ? c.title
            : c.title?.en || c.title?.uz || c.title?.ru || '';
        return title.toLowerCase().includes(q);
      });
    }

    if (filters.hasApartments === 'true') {
      list = list.filter((c) => (c._count?.apartments || 0) > 0);
    } else if (filters.hasApartments === 'false') {
      list = list.filter((c) => (c._count?.apartments || 0) === 0);
    }

    // Sort
    list.sort((a, b) => {
      const dir = filters.sortOrder === 'asc' ? 1 : -1;
      if (filters.sortBy === 'name') {
        const nameA =
          typeof a.title === 'string'
            ? a.title
            : a.title?.en || a.title?.uz || a.title?.ru || '';
        const nameB =
          typeof b.title === 'string'
            ? b.title
            : b.title?.en || b.title?.uz || b.title?.ru || '';
        return nameA.localeCompare(nameB) * dir;
      }
      if (filters.sortBy === 'createdAt') {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      }
      if (filters.sortBy === 'apartmentCount') {
        const aCount = a._count?.apartments || 0;
        const bCount = b._count?.apartments || 0;
        return (aCount - bCount) * dir;
      }
      return 0;
    });

    return list;
  }, [complexes, filters]);

  // Pagination
  const paginatedComplexes = useMemo(() => {
    const start = (filters.page - 1) * filters.limit;
    const end = start + filters.limit;
    return filteredComplexes.slice(start, end);
  }, [filteredComplexes, filters.page, filters.limit]);

  const totalPages = Math.max(1, Math.ceil(filteredComplexes.length / filters.limit));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complex Management</h1>
          <p className="text-gray-600">Manage residential complexes and their apartments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBulkDelete}
            disabled={selectedComplexes.size === 0 || deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedComplexes.size})
          </Button>
          <Link to="/dashboard/admin/complexes/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Complex
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complexes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComplexes}</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Apartments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.complexesWithApartments}</p>
              </div>
              <Home className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.complexesWithApartments}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Apartments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageApartmentsPerComplex.toFixed(1)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search complexes by name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.hasApartments}
              onValueChange={(value) => handleFilterChange('hasApartments', value)}
            >
              <option value="">All</option>
              <option value="true">With Apartments</option>
              <option value="false">Without Apartments</option>
            </Select>
            <Select
              value={filters.hasActiveApartments}
              onValueChange={(value) => handleFilterChange('hasActiveApartments', value)}
            >
              <option value="">All</option>
              <option value="true">With Active Listings</option>
              <option value="false">Without Active Listings</option>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Created</option>
              <option value="apartmentCount">Sort by Apartment Count</option>
            </Select>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Complexes Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading complexes...</p>
          </div>
        ) : filteredComplexes.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No complexes found</h3>
            <p className="text-gray-600 mt-1">Try adjusting your filters or create a new complex.</p>
            <Link to="/dashboard/admin/complexes/new" className="mt-4 inline-block">
              <Button>Create Complex</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedComplexes.size === complexesData?.data.complexes.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complex
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apartments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Listings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedComplexes.map((complex) => {
                    const title =
                      typeof complex.title === 'string'
                        ? complex.title
                        : complex.title?.en ||
                          complex.title?.uz ||
                          complex.title?.ru ||
                          '';
                    return (
                      <tr key={complex.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedComplexes.has(complex.id)}
                            onChange={() => handleSelectComplex(complex.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <Building className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{title}</div>
                              <div className="text-sm text-gray-500">
                                {complex.city} • ID: {complex.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              (complex._count?.apartments || 0) > 0 ? 'default' : 'secondary'
                            }
                          >
                            {complex._count?.apartments || 0} apartments
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">N/A</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(complex.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/dashboard/admin/complexes/${complex.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (complex._count?.apartments && complex._count.apartments > 0) {
                                  alert(
                                    'Cannot delete complex with apartments. Remove apartments first.'
                                  );
                                } else {
                                  deleteMutation.mutate(complex.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(filters.page - 1) * filters.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(filters.page * filters.limit, filteredComplexes.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">
                      {filteredComplexes.length}
                    </span>{' '}
                    complexes
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={filters.page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Complexes</h3>
                <p className="text-gray-600">Are you sure you want to delete {selectedComplexes.size} selected complexes?</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm text-yellow-800">
                This action cannot be undone. All data associated with these complexes will be permanently deleted.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Complexes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}