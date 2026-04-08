import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, History, MapPin, MessageSquare, ClipboardList, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ProfilePage from '@/components/common/ProfilePage';

function StudentDashboardContent() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Data
    const [requests, setRequests] = useState<any[]>([]);
    const [facultyList, setFacultyList] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        reason: '',
        destination: '',
        inchargeId: ''
    });

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [faculty, myRequests] = await Promise.all([
                api.getFacultyList(user.department),
                api.getStudentRequests(user.uid)
            ]);
            setFacultyList(faculty);
            setRequests(Array.isArray(myRequests) ? myRequests : []);
        } catch (error) {
            console.error('Dashboard load error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load dashboard data.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reason || !formData.destination || !formData.inchargeId) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all fields." });
            return;
        }

        const selectedFaculty = facultyList.find(f => f.id === formData.inchargeId);

        setIsSubmitting(true);
        try {
            await api.createRequest({
                studentId: user.uid,
                studentName: user.name,
                rollNo: user.rollNumber,
                department: user.department,
                yearSection: user.yearSection,
                reason: formData.reason,
                destination: formData.destination,
                inchargeId: formData.inchargeId,
                inchargeName: selectedFaculty?.name
            });

            toast({ title: "Success", description: "Permission request submitted successfully." });
            setFormData({ reason: '', destination: '', inchargeId: '' });
            
            // Refresh requests
            const myRequests = await api.getStudentRequests(user.uid);
            setRequests(Array.isArray(myRequests) ? myRequests : []);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed", description: error.message || "Could not submit request." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'exit_marked': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return <CheckCircle2 className="h-4 w-4" />;
            case 'rejected': return <XCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            default: return <ClipboardList className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-1">
                <Card className="sticky top-24 card-premium border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-xl font-black flex items-center gap-2 text-slate-800">
                            <Plus className="h-5 w-5 text-primary" />
                            New Request
                        </CardTitle>
                        <CardDescription className="font-bold text-slate-400 text-xs">Apply for gateway permission</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Leave</Label>
                                <div className="relative group">
                                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        id="reason" 
                                        className="pl-9 input-3d"
                                        placeholder="e.g. Unwell, Emergency" 
                                        value={formData.reason}
                                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="destination" className="font-bold text-slate-700">Destination</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        id="destination" 
                                        className="pl-9 input-3d"
                                        placeholder="e.g. Hostel, Home" 
                                        value={formData.destination}
                                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="inchargeId">Assign To (Faculty)</Label>
                                <Select 
                                    value={formData.inchargeId} 
                                    onValueChange={(val) => setFormData({...formData, inchargeId: val})}
                                >
                                    <SelectTrigger id="inchargeId">
                                        <SelectValue placeholder="Select Faculty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facultyList.map((f) => (
                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full mt-6 btn-3d-purple rounded-2xl h-12 text-base" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Application
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="mobile-title-lg text-slate-800">
                        <History className="h-6 w-6 text-primary inline mr-2" />
                        My Requests
                    </h2>
                    <Badge variant="outline" className="bg-white px-3 py-1 font-bold border-2">{requests.length} Total</Badge>
                </div>

                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <Card className="border-dashed py-16 flex flex-col items-center justify-center text-slate-400 bg-transparent rounded-[2rem]">
                            <ClipboardList className="h-16 w-16 mb-4 opacity-10" />
                            <p className="font-bold tracking-tight">No permission requests yet.</p>
                        </Card>
                    ) : (
                        requests.map((req) => (
                            <Card key={req.id} className="card-premium overflow-hidden border-none cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`px-2 py-1 flex items-center gap-1 font-medium ${getStatusColor(req.status)}`}>
                                                {getStatusIcon(req.status)}
                                                <span className="capitalize">{req.status}</span>
                                            </Badge>
                                            <span className="text-xs text-slate-400">
                                                {format(req.createdAt?._seconds ? new Date(req.createdAt._seconds * 1000) : new Date(req.createdAt || 0), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        {req.uniqueCode && req.status?.toLowerCase() === 'approved' && (
                                            <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 shadow-sm animate-pulse">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block text-center mb-0.5">Gateway Pass</span>
                                                <span className="text-sm font-black text-primary tracking-[0.3em] block text-center">{req.uniqueCode}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</p>
                                            <p className="text-sm font-medium text-slate-700">{req.reason}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination</p>
                                            <p className="text-sm font-medium text-slate-700">{req.destination}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Faculty</p>
                                            <p className="text-sm font-medium text-slate-700">{req.inchargeName || 'N/A'}</p>
                                        </div>
                                        {req.remarks && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Remarks</p>
                                                <p className="text-sm font-medium text-red-600 italic">"{req.remarks}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {req.status === 'exit_marked' && (
                                    <div className="bg-green-50 px-5 py-2 border-t border-green-100 italic text-[10px] text-green-600 text-center">
                                        Student has officially exited the campus.
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StudentDashboard() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <Routes>
                    <Route path="/" element={<StudentDashboardContent />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </main>
        </div>
    );
}
