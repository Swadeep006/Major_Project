import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Search, User, Calendar, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ProfilePage from '@/components/common/ProfilePage';

function HODDashboardContent() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            // HOD typically views all requests for their department
            const data = await api.getEmployeeRequests(user.uid, 'hod', user.department);
            if (Array.isArray(data)) {
                const sorted = data.sort((a: any, b: any) => {
                    const dateA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : a.createdAt || 0;
                    const dateB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : b.createdAt || 0;
                    return dateB - dateA;
                });
                setRequests(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load department requests.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'Accepted' | 'Rejected') => {
        const remarks = remarksMap[requestId] || '';
        try {
            await api.updateRequestStatus(requestId, 'hod', action, remarks, user.name);
            toast({ title: `Request ${action}`, description: `Action processed successfully.` });
            loadRequests();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Action Failed", description: error.message || "Could not update request." });
        }
    };

    const filteredRequests = requests.filter(req => 
        (req.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (req.rollNo?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-2xl shadow-lg ring-4 ring-primary/10">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="mobile-title-lg text-slate-900 tracking-tight leading-none mb-1">HOD Dashboard</h1>
                        <p className="text-slate-500 font-bold text-sm tracking-tight">{user.department} Department Oversight</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search students..." 
                            className="pl-9 input-3d w-full" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                    <Card className="card-premium border-dashed py-20 flex flex-col items-center justify-center text-slate-400 bg-transparent">
                        <Loader2 className="h-16 w-16 mx-auto mb-4 opacity-10 animate-pulse" />
                        <p className="font-bold">No active requests in your department.</p>
                    </Card>
                ) : (
                    filteredRequests.map((req) => (
                        <Card key={req.id} className="card-premium border-none shadow-sm overflow-hidden group">
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-slate-100 h-16 w-16 rounded-3xl flex items-center justify-center shrink-0 border-2 border-slate-200/50 group-hover:rotate-6 transition-transform">
                                            <User className="h-8 w-8 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{req.studentName}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <Badge variant="outline" className="text-xs font-bold border-2 rounded-lg bg-slate-50">{req.rollNo}</Badge>
                                                <span className="text-sm font-bold text-slate-500">{req.yearSection}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:items-end gap-2">
                                        <Badge className={`px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${
                                            req.hodStatus?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                            req.hodStatus?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                            <span className="capitalize">{req.hodStatus || 'Pending Approval'}</span>
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(req.createdAt?._seconds ? new Date(req.createdAt._seconds * 1000) : new Date(req.createdAt || 0), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[1.5rem] border-2 border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason</p>
                                        <p className="text-sm text-slate-800 font-bold">{req.reason}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Destination</p>
                                        <p className="text-sm text-slate-800 font-bold">{req.destination}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Incharge</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-slate-800 font-bold capitalize">{req.inchargeName}</p>
                                            <Badge variant="outline" className="text-[9px] font-black border-2 text-primary">{req.inchargeStatus}</Badge>
                                        </div>
                                    </div>
                                </div>

                                {req.hodStatus === 'Pending' ? (
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 border-t border-slate-100 pt-8">
                                        <div className="flex-1 space-y-2">
                                            <Label className="font-bold text-slate-700 ml-1">Final Approval Remarks</Label>
                                            <Input 
                                                placeholder="Provide decision context..."
                                                value={remarksMap[req.id] || ''}
                                                onChange={(e) => setRemarksMap({...remarksMap, [req.id]: e.target.value})}
                                                className="input-3d"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full lg:w-auto shrink-0 pt-6 lg:pt-0">
                                            <Button 
                                                variant="outline"
                                                className="rounded-2xl h-12 w-full sm:h-14 sm:w-auto px-6 sm:px-8 font-black border-2 border-red-100 text-red-600 hover:bg-red-50"
                                                onClick={() => handleAction(req.id, 'Rejected')}
                                            >
                                                Deny
                                            </Button>
                                            <Button 
                                                className="btn-3d-purple rounded-2xl h-12 w-full sm:h-14 sm:w-auto px-6 sm:px-10"
                                                onClick={() => handleAction(req.id, 'Accepted')}
                                            >
                                                Final Approve
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    req.remarks && (
                                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Decision Feedback</p>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-sm text-slate-600 font-medium">
                                                "{req.remarks}"
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

export default function HODDashboard() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <Routes>
                    <Route path="/" element={<HODDashboardContent />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </main>
        </div>
    );
}
