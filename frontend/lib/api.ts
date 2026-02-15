import { Platform } from 'react-native';

// Adjust this based on your environment
// 10.0.2.2 is for Android Emulator
// 192.168.29.196 is your local LAN IP (for physical devices)
const DEV_API_URL = 'http://192.168.29.196:5000';

// For physical device, you'd need your LAN IP, e.g., 'http://192.168.1.100:5000'

const BASE_URL = DEV_API_URL;

export const api = {
    // Auth
    getUserProfile: async (uid: string) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/user/${uid}`);
            if (!response.ok) throw new Error('Failed to fetch profile');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    studentSignup: async (data: any) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/student/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Signup failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    employeeSignup: async (data: any) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/employee/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Signup failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Student
    getFacultyList: async (department?: string) => {
        try {
            const url = department
                ? `${BASE_URL}/student/employees?department=${encodeURIComponent(department)}&role=incharge`
                : `${BASE_URL}/student/employees/incharge`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch faculty list');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    createRequest: async (data: any) => {
        try {
            const response = await fetch(`${BASE_URL}/student/permission-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create request');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getStudentRequests: async (studentId: string) => {
        try {
            const response = await fetch(`${BASE_URL}/student/requests/${studentId}`);
            if (!response.ok) throw new Error('Failed to fetch requests');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Employee (Incharge, HOD, Security)
    getEmployeeRequests: async (employeeId: string, role: string, department?: string) => {
        try {
            const params = new URLSearchParams({ employeeId, role });
            if (department) params.append('department', department);

            const response = await fetch(`${BASE_URL}/employee/requests?${params.toString()}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    updateRequestStatus: async (requestId: string, role: string, status: string, remarks: string, approverName?: string) => {
        try {
            const response = await fetch(`${BASE_URL}/employee/requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role, status, remarks, approverName }),
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    verifyCode: async (code: string) => {
        try {
            const response = await fetch(`${BASE_URL}/employee/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Verification failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    markExit: async (requestId: string) => {
        try {
            const response = await fetch(`${BASE_URL}/employee/mark-exit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
