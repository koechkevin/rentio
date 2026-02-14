export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  OWNER = 'OWNER',
  CARETAKER = 'CARETAKER',
  TENANT = 'TENANT',
}

export interface PropertyUser {
  id: string;
  user: User;
  property: {
    id: string;
    name: string;
  };
  role: UserRole;
  createdAt: string;
  assignedByUser: User;
}

export interface AssignRoleRequest {
  email: string;
  role: UserRole;
}

export interface AssignRoleResponse {
  success: boolean;
  message: string;
  data?: PropertyUser;
}

export interface PropertyUsersResponse {
  success: boolean;
  data: PropertyUser[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
