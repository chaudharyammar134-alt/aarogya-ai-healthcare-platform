/**
 * Medical API Service
 * Integrates ABDM (Ayushman Bharat Digital Mission), PharmEasy/1mg APIs, and OCR.space
 * Currently in SIMULATION MODE for demonstration
 */

export interface ABDMHealthRecord {
  abhaNumber: string; // Ayushman Bharat Health Account
  name: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  medicalRecords: {
    id: string;
    type: 'prescription' | 'lab-report' | 'discharge-summary' | 'vaccination';
    date: string;
    hospital: string;
    doctor: string;
    summary: string;
    documents: string[];
  }[];
  allergies: string[];
  chronicConditions: string[];
  vaccinations: {
    name: string;
    date: string;
    nextDue?: string;
  }[];
}

export interface MedicineInfo {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  price: number;
  mrp: number;
  discount: number;
  available: boolean;
  prescription_required: boolean;
  category: string;
  dosage: string;
  uses: string[];
  sideEffects: string[];
}

export interface PharmacyOffer {
  partnerId: '1mg' | 'pharmeasy' | 'apollo';
  partnerName: string;
  medicines: MedicineInfo[];
  totalPrice: number;
  totalDiscount: number;
  deliveryCharge: number;
  estimatedDelivery: string;
}

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  parsedData?: {
    type: 'prescription' | 'lab-report' | 'medical-bill' | 'unknown';
    extractedInfo: {
      patientName?: string;
      date?: string;
      doctorName?: string;
      hospitalName?: string;
      medicines?: string[];
      labTests?: string[];
      diagnosis?: string;
    };
  };
}

class MedicalApiService {
  // ============ ABDM (Ayushman Bharat Digital Mission) API ============
  
  /**
   * Fetch health records from ABDM
   * In production: Use ABDM Health Information Provider (HIP) API
   */
  async getABDMHealthRecords(abhaNumber: string): Promise<ABDMHealthRecord | null> {
    console.log('🏥 [ABDM API - SIMULATION] Fetching health records for ABHA:', abhaNumber);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate ABDM health records
    const sampleRecord: ABDMHealthRecord = {
      abhaNumber,
      name: 'Sample Patient',
      dateOfBirth: '1990-01-15',
      gender: 'male',
      bloodGroup: 'O+',
      medicalRecords: [
        {
          id: 'rec_001',
          type: 'prescription',
          date: '2024-10-15',
          hospital: 'Apollo Hospital, Delhi',
          doctor: 'Dr. Sharma',
          summary: 'Seasonal allergy treatment',
          documents: ['prescription_001.pdf'],
        },
        {
          id: 'rec_002',
          type: 'lab-report',
          date: '2024-09-20',
          hospital: 'Max Healthcare',
          doctor: 'Dr. Gupta',
          summary: 'Annual health checkup - All parameters normal',
          documents: ['lab_report_002.pdf'],
        },
      ],
      allergies: ['Pollen', 'Dust'],
      chronicConditions: [],
      vaccinations: [
        { name: 'COVID-19 Booster', date: '2024-08-01' },
        { name: 'Influenza', date: '2024-07-15', nextDue: '2025-07-15' },
      ],
    };
    
    console.log('✅ [ABDM] Health records retrieved successfully');
    return sampleRecord;
  }

  /**
   * Create ABHA (Ayushman Bharat Health Account)
   */
  async createABHA(userData: {
    name: string;
    mobile: string;
    aadhaar?: string;
    dateOfBirth: string;
    gender: string;
  }): Promise<{ abhaNumber: string; abhaAddress: string }> {
    console.log('🆕 [ABDM API - SIMULATION] Creating ABHA for:', userData.name);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate simulated ABHA
    const abhaNumber = `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;
    const abhaAddress = `${userData.name.toLowerCase().replace(/\s+/g, '.')}@abdm`;
    
    console.log('✅ [ABDM] ABHA created:', abhaNumber);
    
    return { abhaNumber, abhaAddress };
  }

  /**
   * Link health records to ABHA
   */
  async linkHealthRecordsToABHA(abhaNumber: string, recordId: string): Promise<boolean> {
    console.log('🔗 [ABDM API - SIMULATION] Linking record to ABHA:', abhaNumber);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('✅ [ABDM] Health record linked successfully');
    return true;
  }

  // ============ PHARMEASY / 1MG PARTNER API ============
  
  /**
   * Search medicines across pharmacy partners
   * In production: Integrate with PharmEasy and 1mg APIs
   */
  async searchMedicine(medicineName: string): Promise<MedicineInfo[]> {
    console.log('💊 [PharmEasy/1mg API - SIMULATION] Searching for:', medicineName);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simulated medicine database with Indian medicines
    const medicines: MedicineInfo[] = [
      {
        id: 'med_001',
        name: 'Dolo 650 Tablet',
        genericName: 'Paracetamol',
        manufacturer: 'Micro Labs',
        price: 25,
        mrp: 30,
        discount: 17,
        available: true,
        prescription_required: false,
        category: 'Fever & Pain',
        dosage: '650mg',
        uses: ['Fever', 'Headache', 'Body pain'],
        sideEffects: ['Nausea', 'Allergic reactions (rare)'],
      },
      {
        id: 'med_002',
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        manufacturer: 'Cipla',
        price: 89,
        mrp: 110,
        discount: 19,
        available: true,
        prescription_required: true,
        category: 'Antibiotic',
        dosage: '500mg',
        uses: ['Bacterial infections', 'Respiratory infections'],
        sideEffects: ['Stomach upset', 'Diarrhea'],
      },
    ];
    
    // Filter based on search
    const results = medicines.filter(med => 
      med.name.toLowerCase().includes(medicineName.toLowerCase()) ||
      med.genericName.toLowerCase().includes(medicineName.toLowerCase())
    );
    
    console.log('✅ Found', results.length, 'medicines');
    return results.length > 0 ? results : medicines.slice(0, 1);
  }

  /**
   * Get best pharmacy offers for medicines
   */
  async getPharmacyOffers(medicineIds: string[]): Promise<PharmacyOffer[]> {
    console.log('🏪 [Pharmacy Partners - SIMULATION] Getting offers for', medicineIds.length, 'medicines');
    
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const medicines = await Promise.all(medicineIds.map(id => this.searchMedicine(id)));
    
    const offers: PharmacyOffer[] = [
      {
        partnerId: '1mg',
        partnerName: '1mg (Tata)',
        medicines: medicines.flat(),
        totalPrice: 114,
        totalDiscount: 26,
        deliveryCharge: 0,
        estimatedDelivery: 'Tomorrow, 2 PM - 6 PM',
      },
      {
        partnerId: 'pharmeasy',
        partnerName: 'PharmEasy',
        medicines: medicines.flat(),
        totalPrice: 109,
        totalDiscount: 31,
        deliveryCharge: 20,
        estimatedDelivery: 'Tomorrow, 10 AM - 2 PM',
      },
      {
        partnerId: 'apollo',
        partnerName: 'Apollo Pharmacy',
        medicines: medicines.flat(),
        totalPrice: 120,
        totalDiscount: 20,
        deliveryCharge: 0,
        estimatedDelivery: 'Today, 6 PM - 10 PM',
      },
    ];
    
    console.log('✅ Found', offers.length, 'pharmacy offers');
    return offers;
  }

  /**
   * Place order with pharmacy partner
   */
  async placePharmacyOrder(
    partnerId: string,
    medicines: string[],
    deliveryAddress: any
  ): Promise<{ orderId: string; trackingUrl: string }> {
    console.log('🛒 [Pharmacy Order - SIMULATION] Placing order with:', partnerId);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orderId = `ORD${Date.now()}`;
    const trackingUrl = `https://${partnerId}.com/track/${orderId}`;
    
    console.log('✅ [Pharmacy] Order placed:', orderId);
    
    return { orderId, trackingUrl };
  }

  // ============ OCR.SPACE API (Medical Document OCR) ============
  
  /**
   * Extract text from medical document using OCR
   * In production: Use OCR.space API or Google Cloud Vision
   */
  async extractTextFromDocument(imageData: string): Promise<OCRResult> {
    console.log('📄 [OCR.Space API - SIMULATION] Processing medical document...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulated OCR result
    const sampleTexts = [
      {
        type: 'prescription' as const,
        text: `
Dr. Rajesh Sharma
MBBS, MD (Medicine)
Apollo Hospital, New Delhi

Date: ${new Date().toLocaleDateString('en-IN')}

Patient: Sample Patient
Age: 35 years

Rx:
1. Tab. Paracetamol 650mg - 1 tab TID for 3 days
2. Tab. Azithromycin 500mg - 1 tab OD for 5 days
3. Syrup Cetirizine 10ml - 2 tsp BD for 5 days

Advice:
- Take medicines after food
- Plenty of rest
- Drink warm water

Follow up after 5 days if symptoms persist.

Dr. Rajesh Sharma
Reg. No: 12345
        `,
        extractedInfo: {
          patientName: 'Sample Patient',
          date: new Date().toLocaleDateString('en-IN'),
          doctorName: 'Dr. Rajesh Sharma',
          hospitalName: 'Apollo Hospital, New Delhi',
          medicines: ['Paracetamol 650mg', 'Azithromycin 500mg', 'Cetirizine Syrup'],
          diagnosis: 'Viral fever with allergic rhinitis',
        },
      },
      {
        type: 'lab-report' as const,
        text: `
Max Healthcare Laboratory
Blood Test Report

Patient: Sample Patient
Date: ${new Date().toLocaleDateString('en-IN')}

Complete Blood Count (CBC):
- Hemoglobin: 14.2 g/dL (Normal: 13-17)
- WBC Count: 8,500 /cumm (Normal: 4,000-11,000)
- Platelet Count: 250,000 /cumm (Normal: 150,000-400,000)

Lipid Profile:
- Total Cholesterol: 180 mg/dL (Normal: <200)
- HDL: 45 mg/dL (Normal: >40)
- LDL: 110 mg/dL (Normal: <130)
- Triglycerides: 125 mg/dL (Normal: <150)

Blood Sugar:
- Fasting: 95 mg/dL (Normal: 70-110)
- Post Prandial: 135 mg/dL (Normal: <140)

All parameters are within normal range.

Authorized Signatory
        `,
        extractedInfo: {
          patientName: 'Sample Patient',
          date: new Date().toLocaleDateString('en-IN'),
          hospitalName: 'Max Healthcare Laboratory',
          labTests: ['CBC', 'Lipid Profile', 'Blood Sugar'],
        },
      },
    ];
    
    const selectedSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    
    const result: OCRResult = {
      success: true,
      text: selectedSample.text,
      confidence: 0.85 + Math.random() * 0.1,
      parsedData: {
        type: selectedSample.type,
        extractedInfo: selectedSample.extractedInfo,
      },
    };
    
    console.log('✅ [OCR] Text extracted successfully. Confidence:', result.confidence);
    
    return result;
  }

  /**
   * Analyze prescription and extract medicine names
   */
  async analyzePrescription(imageData: string): Promise<{
    medicines: string[];
    dosages: string[];
    instructions: string[];
  }> {
    console.log('💊 [Prescription Analysis - SIMULATION] Analyzing prescription...');
    
    const ocrResult = await this.extractTextFromDocument(imageData);
    
    if (ocrResult.parsedData?.type === 'prescription') {
      return {
        medicines: ocrResult.parsedData.extractedInfo.medicines || [],
        dosages: ['650mg TID', '500mg OD', '10ml BD'],
        instructions: ['Take after food', 'Plenty of rest', 'Follow up after 5 days'],
      };
    }
    
    return {
      medicines: [],
      dosages: [],
      instructions: [],
    };
  }

  // ============ HEALTH DOCUMENT STORAGE ============
  
  /**
   * Upload medical document to secure storage
   */
  async uploadMedicalDocument(
    documentData: string,
    metadata: {
      userId: string;
      type: string;
      name: string;
    }
  ): Promise<{ documentId: string; url: string }> {
    console.log('📤 [Document Storage - SIMULATION] Uploading document:', metadata.name);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = `/medical-documents/${documentId}`;
    
    console.log('✅ Document uploaded:', documentId);
    
    return { documentId, url };
  }

  /**
   * Get user's medical documents
   */
  async getUserMedicalDocuments(userId: string): Promise<any[]> {
    console.log('📁 [Document Storage - SIMULATION] Fetching documents for user:', userId);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'doc_001',
        name: 'Prescription - Dr. Sharma',
        type: 'prescription',
        date: '2024-10-15',
        url: '/medical-documents/doc_001',
      },
      {
        id: 'doc_002',
        name: 'Lab Report - Blood Test',
        type: 'lab-report',
        date: '2024-09-20',
        url: '/medical-documents/doc_002',
      },
    ];
  }

  // ============ HELPER METHODS ============
  
  /**
   * Validate ABHA number
   */
  validateABHANumber(abhaNumber: string): boolean {
    // ABHA number is 14 digits
    return /^\d{14}$/.test(abhaNumber);
  }

  /**
   * Format medicine name for search
   */
  formatMedicineSearchQuery(medicineName: string): string {
    return medicineName.trim().toLowerCase();
  }

  /**
   * Calculate medicine delivery date
   */
  getEstimatedDeliveryDate(hours: number): string {
    const deliveryDate = new Date();
    deliveryDate.setHours(deliveryDate.getHours() + hours);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (deliveryDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (deliveryDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return deliveryDate.toLocaleDateString('en-IN');
    }
  }
}

export const medicalApiService = new MedicalApiService();
