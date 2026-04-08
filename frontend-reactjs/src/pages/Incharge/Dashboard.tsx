import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, Clock, Search, Filter, User, Calendar } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ProfilePage from '@/components/common/ProfilePage';

function InchargeDashboardContent() {
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
            const data = await api.getEmployeeRequests(user.uid, 'incharge');
            if (Array.isArray(data)) {
                // Sort by date (newest first)
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
                description: "Failed to load requests.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'Accepted' | 'Rejected') => {
        const remarks = remarksMap[requestId] || '';
        try {
            // Optimistic update
            setRequests(prev => prev.map(req => 
                req.id === requestId ? { ...req, inchargeStatus: action, remarks } : req
            ));

            await api.updateRequestStatus(requestId, 'incharge', action, remarks, user.name);
            
            toast({
                title: `Request ${action}`,
                description: `Successfully updated request for student.`,
            });
            
            // Re-fetch to sync
            loadRequests();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Action Failed",
                description: error.message || "Could not update request.",
            });
            loadRequests(); // Revert
        }
    };

    const filteredRequests = requests.filter(req => 
        (req.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (req.rollNo?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const stats = {
        pending: requests.filter(r => r.inchargeStatus?.toLowerCase() === 'pending').length,
        approved: requests.filter(r => r.inchargeStatus?.toLowerCase() === 'accepted').length,
        total: requests.length
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="mobile-title-lg text-slate-900 tracking-tight mb-2">Incharge Portal</h1>
                    <p className="text-slate-500 font-medium text-sm">Manage student gateway requests for your department</p>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search student or roll no..." 
                            className="pl-9 input-3d w-full" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                <Card className="card-premium border-none bg-orange-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-orange-700">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card className="card-premium border-none bg-student-green-soft">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-student-green uppercase tracking-[0.2em]">Approved Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-student-green">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card className="card-premium border-none bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-primary">{stats.total}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Requests List */}
            <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                    <Card className="card-premium border-dashed py-20 flex flex-col items-center justify-center text-slate-400 bg-transparent">
                        <Clock className="h-16 w-16 mx-auto mb-4 opacity-10" />
                        <p className="font-bold">No requests found matching your search.</p>
                    </Card>
                ) : (
                    filteredRequests.map((req) => (
                        <Card key={req.id} className="card-premium border-none shadow-sm overflow-hidden group">
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-slate-100 h-16 w-16 rounded-3xl flex items-center justify-center shrink-0 border-2 border-slate-200/50 group-hover:rotate-6 transition-transform">
                                            <User className="h-8 w-8 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{req.studentName}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <Badge variant="outline" className="text-xs font-bold border-2 rounded-lg bg-slate-50">{req.rollNo}</Badge>
                                                <span className="text-sm text-slate-500 font-bold">{req.department} • {req.yearSection}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:items-end gap-2">
                                        <Badge className={`px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${
                                            req.inchargeStatus?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                            req.inchargeStatus?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                            {req.inchargeStatus?.toLowerCase() === 'accepted' ? <CheckCircle2 className="h-3 w-3" /> :
                                             req.inchargeStatus?.toLowerCase() === 'rejected' ? <XCircle className="h-3 w-3" /> :
                                             <Clock className="h-3 w-3 animate-pulse" />}
                                            {req.inchargeStatus || 'Pending'}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(req.createdAt?._seconds ? new Date(req.createdAt._seconds * 1000) : new Date(req.createdAt || 0), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-[1.5rem] border-2 border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason</p>
                                        <p className="text-sm text-slate-800 font-bold">{req.reason}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Destination</p>
                                        <p className="text-sm text-slate-800 font-bold">{req.destination}</p>
                                    </div>
                                    <div className="lg:col-span-2 space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Contact</p>
                                        <p className="text-sm text-slate-800 font-bold">{req.studentPhone || 'N/A'}</p>
                                    </div>
                                </div>

                                {req.inchargeStatus === 'Pending' ? (
                                    <div className="mt-8 flex flex-col lg:flex-row lg:items-center gap-6 border-t border-slate-100 pt-8">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor={`remarks-${req.id}`} className="font-bold text-slate-700 ml-1">Review Remarks</Label>
                                            <Input 
                                                id={`remarks-${req.id}`}
                                                placeholder="Provide internal feedback..."
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
                                                <XCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                Reject
                                            </Button>
                                            <Button 
                                                className="btn-3d-green rounded-2xl h-12 w-full sm:h-14 sm:w-auto px-6 sm:px-10"
                                                onClick={() => handleAction(req.id, 'Accepted')}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                Confirm Approval
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Decision Feedback</p>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-sm text-slate-600 font-medium">
                                            {req.remarks ? `"${req.remarks}"` : "No remarks provided."}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

export default function InchargeDashboard() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <Routes>
                    <Route path="/" element={<InchargeDashboardContent />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </main>
        </div>
    );
}
