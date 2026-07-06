import { useState } from 'react';
import { 
  ArrowLeft, 
  Video, 
  Phone, 
  MessageCircle, 
  Clock, 
  Star, 
  ChevronRight,
  Calendar,
  Filter,
  Search,
  MapPin,
  Award,
  Verified
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface TeleconsultationScreenProps {
  onBack: () => void;
}

const specialties = [
  { id: 'general', name: 'General Medicine', count: 12, available: true },
  { id: 'cardiology', name: 'Cardiology', count: 8, available: true },
  { id: 'dermatology', name: 'Dermatology', count: 6, available: true },
  { id: 'pediatric', name: 'Pediatrics', count: 10, available: true },
  { id: 'gynecology', name: 'Gynecology', count: 7, available: true },
  { id: 'orthopedic', name: 'Orthopedics', count: 5, available: false }
];

const doctors = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    specialty: 'General Medicine',
    qualifications: 'MBBS, MD',
    experience: 8,
    rating: 4.9,
    reviews: 324,
    consultationFee: 0,
    languages: ['Hindi', 'English'],
    nextAvailable: '2:30 PM today',
    hospital: 'Apollo Hospitals',
    verified: true,
    consultations: 1200
  },
  {
    id: 2,
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiology',
    qualifications: 'MBBS, DM Cardiology',
    experience: 15,
    rating: 4.8,
    reviews: 567,
    consultationFee: 0,
    languages: ['Hindi', 'Bengali', 'English'],
    nextAvailable: '4:00 PM today',
    hospital: 'AIIMS Delhi',
    verified: true,
    consultations: 2100
  },
  {
    id: 3,
    name: 'Dr. Sunita Patel',
    specialty: 'Dermatology',
    qualifications: 'MBBS, MD Dermatology',
    experience: 12,
    rating: 4.7,
    reviews: 445,
    consultationFee: 0,
    languages: ['Hindi', 'Gujarati', 'English'],
    nextAvailable: 'Tomorrow 10:00 AM',
    hospital: 'Max Healthcare',
    verified: true,
    consultations: 980
  }
];

const timeSlots = [
  { time: '2:30 PM', available: true, type: 'today' },
  { time: '3:00 PM', available: true, type: 'today' },
  { time: '3:30 PM', available: false, type: 'today' },
  { time: '4:00 PM', available: true, type: 'today' },
  { time: '10:00 AM', available: true, type: 'tomorrow' },
  { time: '10:30 AM', available: true, type: 'tomorrow' },
  { time: '11:00 AM', available: true, type: 'tomorrow' }
];

export function TeleconsultationScreen({ onBack }: TeleconsultationScreenProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('general');
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'voice' | 'chat' | null>(null);
  const [step, setStep] = useState<'specialty' | 'doctors' | 'booking'>('specialty');

  const handleSpecialtySelect = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    setStep('doctors');
  };

  const handleDoctorSelect = (doctorId: number, type: 'video' | 'voice' | 'chat') => {
    setSelectedDoctor(doctorId);
    setConsultationType(type);
    setStep('booking');
  };

  const handleBooking = (timeSlot: string) => {
    const doctor = doctors.find(d => d.id === selectedDoctor);
    alert(`Booking ${consultationType} consultation with ${doctor?.name} at ${timeSlot}`);
  };

  if (step === 'booking') {
    const doctor = doctors.find(d => d.id === selectedDoctor);
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('doctors')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">Book Consultation</h1>
              <p className="text-sm text-gray-500">{consultationType} call with {doctor?.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Doctor Summary */}
          <Card className="p-4">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{doctor?.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{doctor?.name}</h3>
                  {doctor?.verified && <Verified className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-sm text-gray-600">{doctor?.specialty}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{doctor?.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{doctor?.experience} years exp</span>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">FREE</Badge>
            </div>
          </Card>

          {/* Time Slots */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Available Time Slots</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Today</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.filter(slot => slot.type === 'today').map((slot, index) => (
                    <Button
                      key={index}
                      variant={slot.available ? "outline" : "ghost"}
                      disabled={!slot.available}
                      onClick={() => slot.available && handleBooking(slot.time)}
                      className={`text-sm ${
                        slot.available 
                          ? 'border-blue-200 text-blue-700 hover:bg-blue-50' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tomorrow</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.filter(slot => slot.type === 'tomorrow').map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleBooking(slot.time)}
                      className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Type */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Consultation Type</h4>
            <div className="flex items-center space-x-3">
              {consultationType === 'video' && <Video className="w-5 h-5 text-green-600" />}
              {consultationType === 'voice' && <Phone className="w-5 h-5 text-blue-600" />}
              {consultationType === 'chat' && <MessageCircle className="w-5 h-5 text-orange-600" />}
              <span className="capitalize font-medium">{consultationType} Consultation</span>
            </div>
          </Card>

          {/* Important Notes */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Join 5 minutes before your appointment</li>
              <li>• Have your previous reports ready</li>
              <li>• Ensure stable internet connection for video calls</li>
              <li>• Prescription will be shared digitally after consultation</li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'doctors') {
    const selectedSpec = specialties.find(s => s.id === selectedSpecialty);
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('specialty')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">{selectedSpec?.name} Doctors</h1>
              <p className="text-sm text-gray-500">{selectedSpec?.count} doctors available</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search doctors..." className="pl-10 h-10 bg-gray-50 border-gray-200" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Doctors List */}
        <div className="p-6 space-y-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Doctor Info */}
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">{doctor.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                          {doctor.verified && <Verified className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <p className="text-xs text-gray-500">{doctor.qualifications}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">FREE</Badge>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-gray-500">({doctor.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">{doctor.experience} yrs</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">{doctor.consultations}</span>
                      </div>
                    </div>

                    {/* Hospital & Languages */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{doctor.hospital}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {doctor.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Next available: {doctor.nextAvailable}
                      </span>
                    </div>

                    {/* Consultation Options */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDoctorSelect(doctor.id, 'video')}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs py-2"
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDoctorSelect(doctor.id, 'voice')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Voice
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDoctorSelect(doctor.id, 'chat')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs py-2"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Note */}
        <div className="p-6">
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm text-green-800 text-center">
              ✅ All consultations are FREE for Arogya+ members
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900">Book Consultation</h1>
            <p className="text-sm text-gray-500">Choose your medical specialty</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search by symptom or specialty..." 
            className="pl-10 h-12 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Emergency Banner */}
        <Card className="p-4 bg-red-50 border-red-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-800">Need urgent care?</h3>
              <p className="text-sm text-red-700">Connect with emergency doctors instantly</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Emergency
            </Button>
          </div>
        </Card>

        {/* Specialties */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Medical Specialties</h2>
          <div className="space-y-3">
            {specialties.map((specialty) => (
              <Card
                key={specialty.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  !specialty.available ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => specialty.available && handleSpecialtySelect(specialty.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{specialty.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{specialty.count} doctors available</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!specialty.available && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                    {specialty.available && <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Why choose Arogya+ consultations?</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Video className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700">HD video consultations with verified doctors</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">Voice calls available for slow internet</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-gray-700">Secure chat with instant responses</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Digital prescriptions and follow-up reminders</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}