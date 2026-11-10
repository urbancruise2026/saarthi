export type EmployeeStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "draft"
  | "resubmitted";
export interface Education {
  qualificationTypes: string;
  qualification?: string;
  institute?: string;
  university?: string;
  schoolName?: string;
  board?: string;
  location: string;
  city: string;
  yearOfPassing: string;
  cgpa: string;
  vocationalCourse?: string;
  pursuing: string;
  pursuingCourse?: string;
  currentYear?: string;
  educationLeft?: string;
  currentStatus?: string;
}

export interface Experience {
  previousCompany: string;
  jobTitle: string;
  duration: string;
  lastSalary: number;
  joiningDate: string;
  relievingDate: string;
  reasonforLeaving: string;
  referenceName: string;
  referenceRoll: string;
  referenceContact: string;
  offerLetterUploaded?: string | null;
  experienceLetterUploaded?: string | null;
  salarySlipUploaded?: string | null;
  bankStatementUploaded?: string | null;
}

export interface Employee {
  id: number;
  employeeId: string;
  tempId: number;
  fullName: string;
  // Personal
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  profilePhoto?: string;
  bloodGroup?: string;
  // Contact
  personalEmail: string;
  mobile: string;
  alternateNumber?: string;
  localName?: string;
  localRelation?: string;

  // Address

  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPincode: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentPincode: string;

  // Employment
  department_id: number;
  subDepartment_id: number;
  role_id: number;
  joiningDate: string;
  confirmationDate: string;
  employeeStatus: string;
  grade: string;
  designation: string;
  noticePeriod: string;
  branchOffice_id: number;
  zoneName: string;
  hrManager: string;
  probationTenure: string;
  employmentType: string;
  workLocation: string;
  manager_id: number;
  password: string;
  username: string;
  shortName: string;
  // Official
  companyEmail: string;
  officeContact: string;
  aliasName: string;
  workShift: string;
  weeklyoff: string;
  ctc: Number;
  basicSalary: Number;
  pfNumber: string;
  esicNumber: string;
  uanNumber: string;
  shiftTiming: string;
  officeLocation: string;
  companyName: string;
  access_role: string;
  // Bank
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: string;
  upiId: string;
  employeeType: string;
  /// ===== EDUCATION (MULTIPLE) =====
  education?: Education[];

  // ===== EXPERIENCE (MULTIPLE) =====
  experience?: Experience[];

  // ===== FAMILY DETAILS =====

  fatherName?: string;
  fatherRelation?: string;
  fatherContact?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherRelation?: string;
  motherContact?: string;
  motherOccupation?: string;
  spouseName?: string;
  spouseRelation?: string;
  spouseContact?: string;
  spouseOccupation?: string;
  siblingName?: string;
  siblingRelation?: string;
  siblingContact?: string;
  siblingOccupation?: string;

  // Docs
  aadhaarUploaded?: string | null;
  panUploaded?: string | null;
  passportPhotoUploaded?: string | null;
  resumeUploaded?: string | null;
  currentAddressProofUploaded?: string | null;

  twelthCertificateUploaded?: string | null;
  graduationCertificateUploaded?: string | null;
  qrCodeUploaded?: string | null;
  signatureUploaded?: string | null;

  status: EmployeeStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  formLink?: string;
  formLinkActive?: boolean;
  rejectionReason?: string;

  department_name: string;
  subDepartment_name: string;
  role_name: string;
  manager_firstName: string;
  officeNumber: string;
  officeEmail: string;
  branch_name: string;
  ho_id: number;
  ho_name: string;
  // ===== HR POLICY =====
  hrPolicyAccepted?: string;
  commitmentDeclarationAccepted?: string;
  informationDeclarationAccepted?: string;
  role: string;
  region_names: string;
  zone_names: string;
  city_names: string;
}
export interface Notification {
  id: string;
  type: "submission" | "approved" | "rejected" | "resubmitted";
  title: string;
  message: string;
  employeeId?: string;
  employeeName?: string;
  read: boolean;
  createdAt: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}
export interface Department {
  id: number;
  uuid: string;
  department_name: string;
  department_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}
export interface Designation {
  id: number;
  uuid: string;
  subDepartment_name: string;
  department_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}
export interface Role {
  id: number;
  uuid: string;
  role_name: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}
export interface travelcity {
  id?: number;
  uuid?: string;
  cityName: string;
}

export interface Policy {
  id: number;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  status: "active" | "pending" | "inactive";
  description: string;
  fileUrl: string;
  hr_head_status: "pending" | "approved" | "rejected" | null;
  hr_head_remark: string | null;
  sho_status: "pending" | "approved" | "rejected" | null;
  sho_remark: string | null;
}
export interface Branch {
  id: number;
  uuid: string;
  branch_name: string;
  branch_code: string;
  location: string;
}
export interface City {
  id: number;
  cityName: string;
  state_id: number;
  stateName?: string;
}

export interface State {
  id: number;
  stateName: string;
}

export interface OnboardingActivities {
  employeeName: string;
  department: string;

  joiningProcess: {
    dateOfJoining: string;
    documentVerification: string;
    employmentForm: string;
    trainingSchedule: string;
    joiningKit: string;
    attendance: string;
  };

  seatingArrangement: {
    deskAllotment: string;
    desktopAllotment: string;
  };

  training: {
    trainingPart1: string;
    hrPolicies2and3: string;
    hrPolicies4and5: string;
    trainingPart2Completed: string;
    remarks: string;
  };

  equipment: {
    mobile: string;
    mobileCover: string;
    simCard: string;
    mobileStand: string;
    headphone: string;
    headphoneStand: string;
    calculator: string;
    digitalBusinessCard: string;
    mobileConfigured: string;
    desktopConfigured: string;
    dsr: string;
    liveDsr: string;
    mobileHandover: string;
  };

  hrProcess: {
    backgroundCheck: string;
    offerLetter: string;
    offerLetterDate: string;
    pagarBook: string;
  };

  confirmation: {
    eligibilityDate: string;
    acceptance: string;
  };
}

export interface Grade {
  id: number;
  gradeName: string;
  designation: string | null;
  created_at?: string;
}
export interface PaginatedEmployeeResponse {
  employees: Employee[];
  currentPage: number;
  totalEmployees: number;
  totalPages: number;
}
export interface Notice {
  id: number;
  title: string;
  category: string;
  notice_date: string;
  status: "Active" | "Inactive" | "Draft" | "Archived";
  description?: string;
  created_at?: string;
  updated_at?: string;
}
export interface IRegion {
  id: number;
  region_name: string;
  country_id: number;
}

export interface IZoneCity {
  id: number;
  city_name: string;
  zone_id: number;
}

export interface IZone {
  id: number;
  zone_name: string;
  region_id: number;
}

export type VerifyStatus = "" | "verified" | "failed" | "pending";
export interface BGVData {
  employeeId: string;
  employeeName: string;
  department: string;
  mobile: string;
  fatherName: string;
  fatherContact: string;
  motherName: string;
  motherContact: string;
  localName: string;
  alternateNumber: string;
  currentAddress: string;
  currentCity?: string | null;
  currentState?: string | null;
  currentPincode?: string | null;
  permanentAddress: string;
  permanentCity?: string | null;
  permanentState?: string | null;
  permanentPincode?: string | null;
  previousCompany: string;
  referenceName: string;
  referenceContact: string;
  verification: {
    contactNumber: VerifyStatus;
    fatherContact: VerifyStatus;
    motherContact: VerifyStatus;
    alternateNumber: VerifyStatus;
    currentAddress: VerifyStatus;
    permanentAddress: VerifyStatus;
    identityProof: VerifyStatus;
    educationProof: VerifyStatus;
    previousEmployment: VerifyStatus;
    criminalRecord: VerifyStatus;
    referenceCheck: VerifyStatus;
  };
  remarks: string;
  overallStatus: VerifyStatus;
}

export interface BGVRecord {
  id: number;
  employee_id: number;        
  fullName: string;           
  overall_status: string | null;
  remarks: string | null;
  alternate_number: string | null;
  contact_number: string | null;
  criminal_record: string | null;
  current_address: string | null;
  education_proof: string | null;
  father_contact: string | null;
  identity_proof: string | null;
  mother_contact: string | null;
  permanent_address: string | null;
  previous_employment: string | null;
  reference_check: string | null;
  created_at: string;
  updated_at: string;
}
