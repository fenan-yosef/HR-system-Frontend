import type {
  Application,
  JobPosting,
  JobPosition,
  PaginatedResponse,
} from "@/types/recruitment";
import type {
  Employee,
  CreateEmployee,
  UpdateEmployee,
} from "@/types/employee";
import type { AttendanceLog, AttendanceEntry } from "@/types/attendance";
import type { AppNotification } from "@/lib/notifications";
import type { Department } from "@/types/department";
import type { DisciplinaryAction } from "@/types/disciplinary";
import type { Complaint } from "@/types/complaint";

// Mock Job Positions
export const mockJobPosition: JobPosition = {
  position_id: 1,
  public_id: "job-001",
  title: "Senior Software Engineer",
  department: 1,
  description: "Build scalable systems",
  status: "open",
  posted_date: "2024-01-01",
  closed_date: null,
  created_at: "2024-01-01T00:00:00Z",
  criteria_version: 1,
};

export const mockJobPositions: PaginatedResponse<JobPosition> = {
  count: 2,
  next: null,
  previous: null,
  results: [
    mockJobPosition,
    {
      ...mockJobPosition,
      position_id: 2,
      title: "Product Manager",
    },
  ],
};

// Mock Job Postings
export const mockJobPosting: JobPosting = {
  posting_id: 1,
  position: mockJobPosition.position_id,
  posted_date: "2024-01-01",
  status: "active",
};

export const mockJobPostings: PaginatedResponse<JobPosting> = {
  count: 1,
  next: null,
  previous: null,
  results: [mockJobPosting],
};

// Mock Applications
export const mockApplication: Application = {
  application_id: 1,
  applicant_name: "John Doe",
  applicant_email: "john@example.com",
  position: mockJobPosition.position_id,
  status: "pending",
  submitted_date: "2024-01-15",
  resume_url: "https://example.com/resume.pdf",
};

export const mockApplications: PaginatedResponse<Application> = {
  count: 1,
  next: null,
  previous: null,
  results: [mockApplication],
};

// Mock Employees
export const mockEmployee: Employee = {
  employee_id: 1,
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  phone: "+1234567890",
  department: 1,
  position: "Senior Engineer",
  employment_type: "full_time",
  hire_date: "2023-01-15",
  status: "active",
  onboarding_completion: 100,
  onboarding_data: {},
  created_at: "2023-01-15T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockEmployees: PaginatedResponse<Employee> = {
  count: 2,
  next: null,
  previous: null,
  results: [
    mockEmployee,
    {
      ...mockEmployee,
      employee_id: 2,
      first_name: "John",
      last_name: "Smith",
      email: "john@example.com",
    },
  ],
};

// Mock Attendance
export const mockAttendanceLog: AttendanceLog = {
  attendance_id: 1,
  employee: 1,
  check_in: "2024-01-15T09:00:00Z",
  check_out: "2024-01-15T17:00:00Z",
  work_hours: 8,
  location: "Office",
  created_at: "2024-01-15T00:00:00Z",
};

export const mockAttendanceLogs = {
  count: 1,
  next: null,
  previous: null,
  results: [mockAttendanceLog],
};

export const mockAttendanceEntry: AttendanceEntry = {
  attendanceId: 1,
  dateKey: "2024-01-15",
  checkIn: "09:00",
  checkInAt: "2024-01-15T09:00:00Z",
  checkOut: "17:00",
  checkOutAt: "2024-01-15T17:00:00Z",
  totalMinutes: 480,
  status: "present",
  location: "Office",
};

// Mock Notifications
export const mockNotification: AppNotification = {
  id: 1,
  title: "New Application",
  description: "You have a new job application",
  createdAt: "2024-01-15T10:00:00Z",
  read: false,
};

export const mockNotifications: AppNotification[] = [
  mockNotification,
  {
    id: 2,
    title: "Application Review",
    description: "Your application is under review",
    createdAt: "2024-01-15T11:00:00Z",
    read: true,
  },
];

// Helper to create variables for testing
export const createMockEmployee = (
  overrides?: Partial<Employee>,
): Employee => ({
  ...mockEmployee,
  ...overrides,
});

export const createMockApplication = (
  overrides?: Partial<Application>,
): Application => ({
  ...mockApplication,
  ...overrides,
});

export const createMockAttendanceLog = (
  overrides?: Partial<AttendanceLog>,
): AttendanceLog => ({
  ...mockAttendanceLog,
  ...overrides,
});

export const createMockNotification = (
  overrides?: Partial<AppNotification>,
): AppNotification => ({
  ...mockNotification,
  ...overrides,
});

// Mock Department
export const mockDepartment: Department = {
  department_id: 1,
  name: "Engineering",
  code: "ENG",
  manager: 1,
  manager_name: "Jane Doe",
  created_at: "2023-01-15T00:00:00Z",
};

export const mockDepartments: PaginatedResponse<Department> = {
  count: 2,
  next: null,
  previous: null,
  results: [
    mockDepartment,
    {
      ...mockDepartment,
      department_id: 2,
      name: "Sales",
      code: "SAL",
      manager: 2,
      manager_name: "John Smith",
    },
  ],
};

// Mock Disciplinary Action
export const mockDisciplinaryAction: DisciplinaryAction = {
  id: 1,
  employee_id: 1,
  employee_name: "Jane Doe",
  action_type: "WARNING",
  severity: "MEDIUM",
  status: "pending",
  description: "Violation of company policy",
  created_at: "2024-01-15T00:00:00Z",
};

export const mockDisciplinaryActions = [
  mockDisciplinaryAction,
  {
    ...mockDisciplinaryAction,
    id: 2,
    action_type: "DEDUCTION",
    severity: "HIGH",
    deduction_amount: "500",
  },
];

// Mock Complaint
export const mockComplaint: Complaint = {
  complaint_id: 1,
  employee_name: "Jane Doe",
  subject: "Workplace Safety Concern",
  category: "WORKPLACE",
  details: "The office air conditioning is not working properly",
  status: "SUBMITTED",
  requested_at: "2024-01-15T10:00:00Z",
};

export const mockComplaints: Complaint[] = [
  mockComplaint,
  {
    ...mockComplaint,
    complaint_id: 2,
    subject: "Payroll Discrepancy",
    category: "PAYROLL",
    details: "I was underpaid for last month",
  },
];

// Helper to create variables for testing
export const createMockDepartment = (
  overrides?: Partial<Department>,
): Department => ({
  ...mockDepartment,
  ...overrides,
});

export const createMockDisciplinaryAction = (
  overrides?: Partial<DisciplinaryAction>,
): DisciplinaryAction => ({
  ...mockDisciplinaryAction,
  ...overrides,
});

export const createMockComplaint = (
  overrides?: Partial<Complaint>,
): Complaint => ({
  ...mockComplaint,
  ...overrides,
});

// Transfer Request Mocks
export const mockTransferRequest: any = {
  transfer_request_id: 1,
  employee: 1,
  current_department: { department_id: 1, name: "IT" },
  target_department: { department_id: 2, name: "HR" },
  current_position: "Software Engineer",
  requested_position: "HR Specialist",
  reason: "Looking for a career change",
  status: "PENDING",
  requested_at: "2024-01-15T10:00:00Z",
  hr_reviewed_at: null,
  ceo_reviewed_at: null,
  reviewed_by_hr: null,
  approved_by_ceo: null,
  hr_comment: null,
  ceo_comment: null,
};

export const mockTransferRequests: any[] = [
  mockTransferRequest,
  {
    ...mockTransferRequest,
    transfer_request_id: 2,
    reason: "Seeking new challenges",
    status: "APPROVED",
  },
];
