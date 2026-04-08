import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Auth
    getUserProfile: async (uid: string) => {
        try {
            const response = await apiInstance.get(`/auth/user/${uid}`);
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    studentSignup: async (data: any) => {
        try {
            const response = await apiInstance.post('/auth/student/signup', data);
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    employeeSignup: async (data: any) => {
        try {
            const response = await apiInstance.post('/auth/employee/signup', data);
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    // Student
    getFacultyList: async (department?: string) => {
        try {
            const url = department
                ? `/student/employees?department=${encodeURIComponent(department)}&role=incharge`
                : `/student/employees/incharge`;
            const response = await apiInstance.get(url);
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    createRequest: async (data: any) => {
        try {
            const response = await apiInstance.post('/student/permission-request', data);
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    getStudentRequests: async (studentId: string) => {
        try {
            const response = await apiInstance.get(`/student/requests/${studentId}`);
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    // Employee (Incharge, HOD, Security)
    getEmployeeRequests: async (employeeId: string, role: string, department?: string) => {
        try {
            const params: any = { employeeId, role };
            if (department) params.department = department;

            const response = await apiInstance.get('/employee/requests', { params });
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    updateRequestStatus: async (requestId: string, role: string, status: string, remarks: string, approverName?: string) => {
        try {
            const response = await apiInstance.patch(`/employee/requests/${requestId}`, {
                role, status, remarks, approverName
            });
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    verifyCode: async (code: string) => {
        try {
            const response = await apiInstance.post('/employee/verify-code', { code });
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    },

    markExit: async (requestId: string) => {
        try {
            const response = await apiInstance.post('/employee/mark-exit', { requestId });
            return response.data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error.response?.data || error;
        }
    }
};
