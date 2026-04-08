import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, User, MapPin, MessageSquare, CheckCircle2, History, LogOut, ArrowLeft, Calendar, ClipboardCheck, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/badge';
import ProfilePage from '@/components/common/ProfilePage';
import { format } from 'date-fns';

function SecurityDashboardContent() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [view, setView] = useState<'verification' | 'history'>('verification');
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifiedRequest, setVerifiedRequest] = useState<any>(null);
    const [markingExit, setMarkingExit] = useState(false);
    
    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || code.length < 6) {
            toast({ variant: "destructive", title: "Invalid Code", description: "Please enter a 6-digit verification code." });
            return;
        }

        setVerifying(true);
        setVerifiedRequest(null);
        try {
            const data = await api.verifyCode(code);
            if (data.valid) {
                setVerifiedRequest(data);
                toast({ title: "Code Verified", description: `Request for ${data.name} is valid and approved.` });
            } else {
                toast({ variant: "destructive", title: "Invalid Code", description: "The code entered is incorrect or expired." });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Verification Failed", description: error.message || "An error occurred during verification." });
        } finally {
            setVerifying(false);
        }
    };

    const handleMarkExit = async () => {
        if (!verifiedRequest) return;
        setMarkingExit(true);
        try {
            await api.markExit(verifiedRequest.requestId);
            toast({ title: "Exit Logged", description: "Student exit has been successfully recorded." });
            setVerifiedRequest(null);
            setCode('');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to log exit." });
        } finally {
            setMarkingExit(false);
        }
    };

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await api.getEmployeeRequests(user.uid, 'security');
            setHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load history:', error);
            toast({ variant: "destructive", title: "History Error", description: "Could not fetch exit logs." });
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (view === 'history') {
            loadHistory();
        }
    }, [view]);

    if (view === 'history') {
        return (
            <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setView('verification')} className="rounded-2xl h-12 w-12 bg-slate-100 hover:bg-slate-200">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="mobile-title-lg text-slate-900 tracking-tight leading-none mb-1">Exit History</h1>
                        <p className="text-slate-500 font-bold text-sm tracking-tight">Audit log of successfully recorded exits</p>
                    </div>
                </div>
            </div>

                {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                        <p className="text-slate-400 mt-6 font-black tracking-widest uppercase text-xs">Fetching audit logs...</p>
                    </div>
                ) : history.length === 0 ? (
                    <Card className="card-premium border-dashed py-24 text-center bg-transparent border-slate-200">
                        <History className="h-16 w-16 mx-auto mb-6 text-slate-200 opacity-20" />
                        <p className="text-slate-500 font-bold text-lg mb-8">No exits have been recorded yet.</p>
                        <Button className="btn-3d-purple rounded-2xl h-14 px-10" onClick={() => setView('verification')}>
                            Return to Verification
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {history.map((req) => (
                            <Card key={req.id} className="card-premium border-none shadow-sm hover:translate-y-[-4px] group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <ClipboardCheck className="h-5 w-5 text-green-700" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 leading-tight">{req.studentName}</h3>
                                                <p className="text-xs text-slate-500 font-medium">{req.rollNo || req.rollNumber}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-600 border-none font-bold">COMPLETED</Badge>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-slate-50">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="space-y-1">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest">Reason</p>
                                                <p className="text-slate-700 font-medium truncate">{req.reason}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest">Destination</p>
                                                <p className="text-slate-700 font-medium truncate">{req.destination}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-md p-2 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> Exit Time
                                            </span>
                                            <span className="text-xs font-bold text-slate-700">
                                                {format(req.exitTime?._seconds ? new Date(req.exitTime._seconds * 1000) : new Date(req.exitTime || 0), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-12 px-4 sm:px-0 animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <div className="bg-primary h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-4 border-primary/10 shadow-2xl rotate-3">
                    <ShieldCheck className="h-10 w-10 text-white" />
                </div>
                <h1 className="mobile-title-lg text-slate-900 tracking-tight text-center leading-none mb-2">Security Portal</h1>
                <p className="text-slate-500 font-bold text-sm text-center tracking-tight">Verify gateway codes and log student exits</p>
            </div>

            <Card className="card-premium border-none shadow-xl overflow-hidden mb-8 bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-6">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-800">Verification</CardTitle>
                        <CardDescription className="font-bold text-slate-400">Enter the student's unique gateway code</CardDescription>
                    </div>
                    <Button variant="ghost" onClick={() => setView('history')} className="font-bold text-primary hover:bg-primary/5 rounded-xl">
                        <History className="mr-2 h-4 w-4" /> Logs
                    </Button>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="code" className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Unique Gateway Pass</Label>
                            <div className="relative group">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    id="code"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className="pl-14 h-16 text-2xl font-black tracking-[0.5em] input-3d text-center"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-2">Codes are generated after HOD approval</p>
                        </div>
                        <Button type="submit" className="w-full btn-3d-purple h-16 rounded-2xl text-lg font-black" disabled={verifying || code.length < 6}>
                            {verifying ? <Loader2 className="h-6 w-6 animate-spin" /> : "Verify Access Code"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {verifiedRequest && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="card-premium border-none bg-student-green-soft overflow-hidden">
                        <div className="bg-student-green h-2 w-full"></div>
                        <CardContent className="p-8">
                            <div className="flex items-center gap-6 mb-8 text-left">
                                <div className="bg-student-green/10 h-16 w-16 rounded-3xl flex items-center justify-center border-2 border-student-green/20">
                                    <User className="h-8 w-8 text-student-green" />
                                </div>
                                <div>
                                    <Badge className="bg-student-green text-white font-black px-3 py-1 mb-2 hover:bg-student-green">VALID PASS</Badge>
                                    <h3 className="text-2xl font-black text-slate-900 leading-none">{verifiedRequest.name}</h3>
                                    <p className="text-sm font-bold text-slate-500 mt-1">{verifiedRequest.rollNo || verifiedRequest.rollNumber} • {verifiedRequest.department}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/60 p-6 rounded-[1.5rem] border border-student-green/10 backdrop-blur-sm mb-8 text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                                    <p className="text-sm text-slate-800 font-bold">{verifiedRequest.reason}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</p>
                                    <p className="text-sm text-slate-800 font-bold">{verifiedRequest.destination}</p>
                                </div>
                            </div>

                            <Button 
                                className="w-full btn-3d-green h-16 rounded-2xl text-lg font-black" 
                                onClick={handleMarkExit}
                                disabled={markingExit}
                            >
                                {markingExit ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <LogOut className="h-6 w-6 mr-2" />}
                                Complete Exit Scanning
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="mt-12 text-center">
                <Button variant="ghost" className="text-slate-500 font-bold hover:bg-white" onClick={() => setView('history')}>
                    <History className="mr-2 h-4 w-4" /> View Day Analytics
                </Button>
            </div>
        </div>
    );
}

export default function SecurityDashboard() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="container mx-auto px-4">
                <Routes>
                    <Route path="/" element={<SecurityDashboardContent />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </main>
        </div>
    );
}
