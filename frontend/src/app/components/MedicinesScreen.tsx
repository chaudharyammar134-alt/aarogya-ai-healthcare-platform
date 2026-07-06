import { useState } from 'react';
import { ArrowLeft, MapPin, Star, Phone, Percent, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface MedicinesScreenProps {
  onBack: () => void;
}

const pharmacies = [
  {
    id: 1,
    name: 'Rajesh Medical Store',
    address: 'Main Market, Near Bus Stand',
    distance: '0.5 km',
    rating: 4.6,
    isOpen: true,
    discount: 25,
    phone: '+91 98765 43210',
    medicines: ['Paracetamol', 'Crocin', 'Dolo 650', 'ORS'],
    deliveryAvailable: true
  },
  {
    id: 2,
    name: 'Shree Krishna Pharmacy',
    address: 'Hospital Road, Block A',
    distance: '1.2 km',
    rating: 4.8,
    isOpen: true,
    discount: 20,
    phone: '+91 98765 43211',
    medicines: ['Insulin', 'BP Tablets', 'Diabetes Medicine'],
    deliveryAvailable: false
  },
  {
    id: 3,
    name: 'Ganga Medical Hall',
    address: 'Old City Area, Sector 3',
    distance: '2.1 km',
    rating: 4.4,
    isOpen: false,
    discount: 15,
    phone: '+91 98765 43212',
    medicines: ['Antibiotics', 'Ayurvedic Medicines', 'Vitamins'],
    deliveryAvailable: true
  }
];

const commonMedicines = [
  { name: 'Paracetamol 500mg', price: '₹12', discountPrice: '₹9', discount: 25 },
  { name: 'Crocin Advance', price: '₹24', discountPrice: '₹18', discount: 25 },
  { name: 'Dolo 650mg', price: '₹18', discountPrice: '₹13.50', discount: 25 },
  { name: 'ORS Packets (21)', price: '₹45', discountPrice: '₹34', discount: 25 },
  { name: 'Cetirizine 10mg', price: '₹15', discountPrice: '₹11', discount: 25 },
  { name: 'Vitamin D3', price: '₹85', discountPrice: '₹64', discount: 25 }
];

export function MedicinesScreen({ onBack }: MedicinesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pharmacies' | 'medicines'>('pharmacies');

  const handleCallPharmacy = (phone: string, name: string) => {
    // In a real app, this would initiate a phone call
    alert(`Calling ${name} at ${phone}`);
  };

  const handleOrderMedicine = (medicine: string, pharmacy: string) => {
    // In a real app, this would handle ordering
    alert(`Ordering ${medicine} from ${pharmacy}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Order Medicines</h1>
            <p className="text-sm text-gray-600">Up to 25% discount available</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search medicines or pharmacies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          <Button
            variant={selectedTab === 'pharmacies' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('pharmacies')}
            className={`flex-1 rounded-lg ${
              selectedTab === 'pharmacies' ? 'bg-white shadow-sm' : ''
            }`}
          >
            Nearby Pharmacies
          </Button>
          <Button
            variant={selectedTab === 'medicines' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('medicines')}
            className={`flex-1 rounded-lg ${
              selectedTab === 'medicines' ? 'bg-white shadow-sm' : ''
            }`}
          >
            Common Medicines
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {selectedTab === 'pharmacies' && (
          <div className="space-y-4">
            {/* Discount Banner */}
            <Card className="p-4 brand-orange text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Arogya+ Member Benefits</h3>
                  <p className="text-sm opacity-90">Get up to 25% discount on all medicines</p>
                </div>
              </div>
            </Card>

            {/* Pharmacy List */}
            {pharmacies.map((pharmacy) => (
              <Card key={pharmacy.id} className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{pharmacy.name}</h3>
                        {pharmacy.isOpen ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Open</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Closed</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{pharmacy.distance}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{pharmacy.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{pharmacy.discount}%</div>
                      <div className="text-xs text-gray-600">discount</div>
                    </div>
                  </div>

                  {/* Available Medicines Preview */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available medicines:</p>
                    <div className="flex flex-wrap gap-1">
                      {pharmacy.medicines.slice(0, 3).map((medicine, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {medicine}
                        </Badge>
                      ))}
                      {pharmacy.medicines.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pharmacy.medicines.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleCallPharmacy(pharmacy.phone, pharmacy.name)}
                      disabled={!pharmacy.isOpen}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    {pharmacy.deliveryAvailable && (
                      <Button
                        variant="outline"
                        disabled={!pharmacy.isOpen}
                        className="flex-1 border-green-500 text-green-600 rounded-xl"
                      >
                        Order Online
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'medicines' && (
          <div className="space-y-4">
            {/* Info Banner */}
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-sm text-green-800 text-center">
                💊 Showing discounted prices for Arogya+ members
              </p>
            </Card>

            {/* Medicine List */}
            <div className="space-y-3">
              {commonMedicines.map((medicine, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{medicine.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500 line-through">{medicine.price}</span>
                        <span className="text-lg font-semibold text-green-600">{medicine.discountPrice}</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {medicine.discount}% OFF
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOrderMedicine(medicine.name, 'Rajesh Medical Store')}
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                    >
                      Order Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 pb-8">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-blue-800">Medicine Ordering Guidelines</h4>
            <p className="text-sm text-blue-700">
              • Valid prescription required for Schedule-H medicines<br />
              • Free delivery available for orders above ₹200<br />
              • Cash on delivery and online payment both accepted
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}