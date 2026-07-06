import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Users, Calendar, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface HealthCampScreenProps {
  onBack: () => void;
}

const upcomingCamps = [
  {
    id: 1,
    title: 'General Health Checkup',
    date: 'Tomorrow, Aug 15',
    time: '9:00 AM - 4:00 PM',
    location: 'Village Community Center',
    address: 'Near Primary School, Main Road',
    services: ['Blood Pressure', 'Diabetes Test', 'Weight Check', 'General Consultation'],
    spotsLeft: 23,
    totalSpots: 50,
    isFree: true
  },
  {
    id: 2,
    title: 'Women & Child Health Camp',
    date: 'Aug 18, Sunday',
    time: '10:00 AM - 3:00 PM',
    location: 'Anganwadi Center',
    address: 'Block A, Sector 2',
    services: ['Pregnancy Care', 'Child Vaccination', 'Nutrition Counseling', 'Health Education'],
    spotsLeft: 15,
    totalSpots: 30,
    isFree: true
  },
  {
    id: 3,
    title: 'Eye & Dental Checkup',
    date: 'Aug 22, Thursday',
    time: '11:00 AM - 5:00 PM',
    location: 'Government Primary Health Center',
    address: 'District Hospital Complex',
    services: ['Eye Examination', 'Dental Checkup', 'Glasses Prescription', 'Oral Health'],
    spotsLeft: 8,
    totalSpots: 40,
    isFree: true
  }
];

const pastCamps = [
  {
    id: 4,
    title: 'Monsoon Health Camp',
    date: 'Aug 8, 2024',
    attendees: 45,
    status: 'completed'
  },
  {
    id: 5,
    title: 'Senior Citizens Health Camp',
    date: 'Aug 1, 2024',
    attendees: 32,
    status: 'completed'
  }
];

export function HealthCampScreen({ onBack }: HealthCampScreenProps) {
  const [selectedCamp, setSelectedCamp] = useState<number | null>(null);

  const handleBookCamp = (campId: number) => {
    // In a real app, this would handle the booking logic
    alert(`Booking confirmed for health camp ${campId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Health Camps</h1>
            <p className="text-sm text-gray-600">Free checkups in your area</p>
          </div>
        </div>
      </div>

      {/* Upcoming Camps */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Upcoming Camps</h3>
          <Badge className="bg-green-100 text-green-800">
            <Calendar className="w-3 h-3 mr-1" />
            {upcomingCamps.length} camps
          </Badge>
        </div>

        <div className="space-y-4">
          {upcomingCamps.map((camp) => (
            <Card key={camp.id} className="p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{camp.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{camp.date}</p>
                  </div>
                  {camp.isFree && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      FREE
                    </Badge>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{camp.time}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-medium">{camp.location}</p>
                      <p className="text-xs">{camp.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{camp.spotsLeft} spots left out of {camp.totalSpots}</span>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Services Available:</p>
                  <div className="flex flex-wrap gap-2">
                    {camp.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Availability</span>
                    <span className="text-gray-800 font-medium">
                      {Math.round((camp.spotsLeft / camp.totalSpots) * 100)}% available
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="brand-green h-2 rounded-full transition-all"
                      style={{ width: `${(camp.spotsLeft / camp.totalSpots) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  onClick={() => handleBookCamp(camp.id)}
                  className="w-full brand-green text-white rounded-xl touch-target"
                  disabled={camp.spotsLeft === 0}
                >
                  {camp.spotsLeft === 0 ? 'Fully Booked' : 'Book Your Spot'}
                  {camp.spotsLeft > 0 && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Camps */}
      <div className="px-6 pb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Camps</h3>
        <div className="space-y-3">
          {pastCamps.map((camp) => (
            <Card key={camp.id} className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">{camp.title}</h4>
                  <p className="text-sm text-gray-500">{camp.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{camp.attendees} attended</p>
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Information Card */}
      <div className="px-6 pb-8">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-blue-800">Important Information</h4>
            <p className="text-sm text-blue-700">
              • Bring your Aadhar card and any previous medical reports<br />
              • Camps are conducted by qualified medical professionals<br />
              • All basic health checkups are completely free
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}