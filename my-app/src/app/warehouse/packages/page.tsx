// src/app/warehouse/packages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaBox, FaBoxes, FaUser, FaBarcode, FaRuler, FaWeight, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';

interface Package {
  _id: string;
  trackingNumber: string;
  status: 'received' | 'in_transit' | 'delivered' | 'unknown';
  sender: string;
  recipient: {
    name: string;
    email: string;
    shippingId: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
    weight: number;
    weightUnit: 'kg' | 'lb';
  };
  receivedAt: string;
  notes?: string;
}

export default function WarehousePackagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authenticated or not warehouse staff
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/warehouse/login');
    }
  }, [status, router]);

  // Load packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/warehouse/packages');
        const data = await res.json();
        if (res.ok) {
          setPackages(data.packages);
        } else {
          throw new Error(data.message || 'Failed to load packages');
        }
      } catch (error) {
        console.error('Error loading packages:', error);
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchPackages();
    }
  }, [status]);

  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg => 
    pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.recipient?.shippingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle package status update
  const updatePackageStatus = async (packageId: string, status: string) => {
    try {
      const res = await fetch(`/api/warehouse/packages/${packageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update package status');
      }

      // Update local state
      setPackages(packages.map(pkg => 
        pkg._id === packageId ? { ...pkg, status } : pkg
      ));

      toast.success('Package status updated successfully');
    } catch (error) {
      console.error('Error updating package status:', error);
      toast.error('Failed to update package status');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Package Management</h1>
        <div className="flex space-x-4 w-full md:w-auto">
          <Link
            href="/warehouse/add-package"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" /> Add Package
          </Link>
          <Link
            href="/warehouse/bulk-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaBoxes className="mr-2" /> Bulk Upload
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md p-3 border"
            placeholder="Search by tracking #, customer name, or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPackages.length === 0 ? (
            <li className="p-4 text-center text-gray-500">
              {searchTerm ? 'No packages match your search' : 'No packages found'}
            </li>
          ) : (
            filteredPackages.map((pkg) => (
              <li key={pkg._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaBox className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {pkg.trackingNumber}
                          </p>
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pkg.status === 'received' ? 'bg-green-100 text-green-800' :
                            pkg.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                            pkg.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {pkg.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaUser className="mr-1" />
                            <span>{pkg.recipient?.name || 'Unknown'}</span>
                            {pkg.recipient?.shippingId && (
                              <span className="ml-2 px-2 bg-gray-100 text-xs rounded">
                                ID: {pkg.recipient.shippingId}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-400">
                            <FaRuler className="mr-1" />
                            <span className="mr-3">
                              {pkg.dimensions.length}x{pkg.dimensions.width}x{pkg.dimensions.height} {pkg.dimensions.unit}
                            </span>
                            <FaWeight className="mr-1" />
                            <span>
                              {pkg.dimensions.weight} {pkg.dimensions.weightUnit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="flex space-x-2">
                      <Link
                        href={`/warehouse/packages/${pkg._id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaInfoCircle className="mr-1" /> Details
                      </Link>
                      <select
                        value={pkg.status}
                        onChange={(e) => updatePackageStatus(pkg._id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="received">Received</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        {pkg.status === 'unknown' && <option value="unknown">Unknown</option>}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Received: {new Date(pkg.receivedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}