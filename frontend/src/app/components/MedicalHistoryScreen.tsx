import { useState } from 'react';
import { Upload, FileText, Plus, X, Heart, AlertTriangle, Pill } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import type { UserData, MedicalCondition } from '../types/user';

interface MedicalHistoryScreenProps {
  user: UserData | null;
  onComplete: (userData: UserData) => void;
  onSkip: () => void;
}

export function MedicalHistoryScreen({ user, onComplete, onSkip }: MedicalHistoryScreenProps) {
  const [medicalConditions, setMedicalConditions] = useState<MedicalCondition[]>(user?.medicalConditions || []);
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || []);
  const [currentMedications, setCurrentMedications] = useState<string[]>(user?.currentMedications || []);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  // Form states for adding new items
  const [newCondition, setNewCondition] = useState('');
  const [newConditionSeverity, setNewConditionSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const addMedicalCondition = () => {
    if (newCondition.trim()) {
      const condition: MedicalCondition = {
        name: newCondition.trim(),
        severity: newConditionSeverity,
        medications: [],
        restrictions: []
      };
      setMedicalConditions([...medicalConditions, condition]);
      setNewCondition('');
      setNewConditionSeverity('mild');
    }
  };

  const removeMedicalCondition = (index: number) => {
    setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const addMedication = () => {
    if (newMedication.trim() && !currentMedications.includes(newMedication.trim())) {
      setCurrentMedications([...currentMedications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setCurrentMedications(currentMedications.filter(m => m !== medication));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles([...uploadedFiles, ...fileNames]);
    }
  };

  const handleComplete = () => {
    if (user) {
      const updatedUser: UserData = {
        ...user,
        medicalConditions,
        allergies,
        currentMedications
      };
      onComplete(updatedUser);
    }
  };

  const commonConditions = [
    'Diabetes Type 2',
    'High Blood Pressure',
    'Heart Disease',
    'Asthma',
    'Arthritis',
    'Thyroid Issues',
    'PCOD/PCOS',
    'Migraine',
    'Depression',
    'Anxiety'
  ];

  const commonAllergies = [
    'Dust',
    'Pollen',
    'Nuts',
    'Dairy',
    'Shellfish',
    'Eggs',
    'Soy',
    'Gluten',
    'Penicillin'
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <Heart className="w-16 h-16 text-wellness-green mx-auto" />
        <h2 className="text-wellness-dark">Medical History</h2>
        <p className="text-wellness-light">
          Help us understand your health better for personalized recommendations
        </p>
      </div>

      <div className="space-y-8">
        {/* Upload Prescriptions */}
        <div className="space-y-4">
          <h3 className="flex items-center space-x-2 text-wellness-dark">
            <FileText className="w-5 h-5" />
            <span>Upload Prescriptions & Reports</span>
          </h3>
          
          <div className="border-2 border-dashed border-gray-200 rounded-wellness p-6 text-center">
            <Upload className="w-8 h-8 text-wellness-green mx-auto mb-2" />
            <p className="text-sm text-wellness-light mb-4">
              Upload your recent prescriptions, lab reports, or medical documents
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files:</Label>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-wellness-gray rounded-lg">
                  <span className="text-sm text-wellness-dark">{file}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical Conditions */}
        <div className="space-y-4">
          <h3 className="flex items-center space-x-2 text-wellness-dark">
            <AlertTriangle className="w-5 h-5" />
            <span>Medical Conditions</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {commonConditions.map((condition) => (
              <Button
                key={condition}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!medicalConditions.find(c => c.name === condition)) {
                    setMedicalConditions([...medicalConditions, {
                      name: condition,
                      severity: 'mild',
                      medications: [],
                      restrictions: []
                    }]);
                  }
                }}
                className={medicalConditions.find(c => c.name === condition) ? 'bg-wellness-green text-white' : ''}
              >
                {condition}
              </Button>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Add custom condition"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              className="flex-1"
            />
            <Select value={newConditionSeverity} onValueChange={(value: any) => setNewConditionSeverity(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addMedicalCondition}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {medicalConditions.length > 0 && (
            <div className="space-y-2">
              {medicalConditions.map((condition, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-wellness-gray rounded-lg">
                  <div>
                    <span className="font-medium text-wellness-dark">{condition.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {condition.severity}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedicalCondition(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="space-y-4">
          <h3 className="text-wellness-dark">Known Allergies</h3>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {commonAllergies.map((allergy) => (
              <Button
                key={allergy}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!allergies.includes(allergy)) {
                    setAllergies([...allergies, allergy]);
                  }
                }}
                className={allergies.includes(allergy) ? 'bg-wellness-yellow text-wellness-dark' : ''}
              >
                {allergy}
              </Button>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Add custom allergy"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addAllergy}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge key={allergy} variant="secondary" className="flex items-center space-x-1">
                  <span>{allergy}</span>
                  <button onClick={() => removeAllergy(allergy)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Current Medications */}
        <div className="space-y-4">
          <h3 className="flex items-center space-x-2 text-wellness-dark">
            <Pill className="w-5 h-5" />
            <span>Current Medications</span>
          </h3>

          <div className="flex space-x-2">
            <Input
              placeholder="Add medication name"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addMedication}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {currentMedications.length > 0 && (
            <div className="space-y-2">
              {currentMedications.map((medication) => (
                <div key={medication} className="flex items-center justify-between p-3 bg-wellness-gray rounded-lg">
                  <span className="text-wellness-dark">{medication}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(medication)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onSkip}
        >
          Skip for Now
        </Button>

        <Button
          onClick={handleComplete}
          className="wellness-green text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
