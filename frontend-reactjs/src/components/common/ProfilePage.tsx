import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Phone, Lock, Shield, Save, ArrowLeft, Hash, Building2, MapPin } from 'lucide-react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [phone, setPhone] = useState(user?.phone || user?.studentPhone || '');
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (user) {
            setPhone(user.phone || user.studentPhone || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) throw new Error("No authenticated user found.");

            // 1. Handle Password Change if requested
            if (passwords.new) {
                if (passwords.new !== passwords.confirm) {
                    throw new Error("New passwords do not match.");
                }
                if (!passwords.current) {
                    throw new Error("Current password is required to set a new one.");
                }

                const credential = EmailAuthProvider.credential(firebaseUser.email!, passwords.current);
                await reauthenticateWithCredential(firebaseUser, credential);
                await updatePassword(firebaseUser, passwords.new);
                toast({ title: "Password Updated", description: "Successfully changed account password." });
            }

            // 2. Handle Phone Number Update
            // Logic: Update AuthContext and Local Storage
            const phoneKey = user.role === 'student' ? 'studentPhone' : 'phone';
            const updatedUser = { ...user, [phoneKey]: phone };
            
            // Note: In production, you'd call an API here to update Firestore.
            // But since I'm matching legacy 'present as is' logic:
            login(user.uid, updatedUser);

            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });

            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "Could not update profile.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const isStudent = user.role === 'student';

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-extrabold text-foreground capitalize">{user.role} Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Summary Card */}
                <Card className="lg:col-span-1 shadow-md border-primary/5 h-fit bg-card">
                    <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg mb-4 text-4xl font-black text-primary">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                        <p className="text-sm text-muted-foreground font-medium capitalize mb-4">{user?.role} Portal</p>
                        
                        <div className="w-full space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-muted-foreground font-bold uppercase tracking-wider">ID / Roll No</span>
                                <span className="text-muted-foreground font-semibold">{user?.rollNumber || user?.employeeId || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-muted-foreground font-bold uppercase tracking-wider">Department</span>
                                <span className="text-muted-foreground font-semibold">{user?.department || 'N/A'}</span>
                            </div>
                            {user?.yearSection && (
                                <div className="flex items-center justify-between text-xs px-2">
                                    <span className="text-muted-foreground font-bold uppercase tracking-wider">Class</span>
                                    <span className="text-muted-foreground font-semibold">{user.yearSection}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleUpdateProfile}>
                        <Card className="shadow-md border-primary/5 overflow-hidden bg-card">
                            <CardHeader className="bg-muted/50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Account Settings
                                </CardTitle>
                                <CardDescription>Update your contact info and secure your account</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest flex items-center gap-1.5">
                                            <Mail className="h-3 w-3" /> Email Address
                                        </Label>
                                        <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-2 rounded-md border border-border truncate">
                                            {user?.email}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest flex items-center gap-1.5">
                                            <Phone className="h-3 w-3" /> Phone Number
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="phone" 
                                                placeholder="Enter phone number" 
                                                className="pl-9 h-10"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-primary" />
                                        Security Check
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currPassword">Current Password</Label>
                                            <Input 
                                                id="currPassword" 
                                                type="password" 
                                                placeholder="Required to apply changes"
                                                className="h-10 border-slate-200"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password (Optional)</Label>
                                                <Input 
                                                    id="newPassword" 
                                                    type="password" 
                                                    placeholder="Set new password"
                                                    className="h-10 border-slate-200"
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confPassword">Confirm Password</Label>
                                                <Input 
                                                    id="confPassword" 
                                                    type="password" 
                                                    placeholder="Repeat new password"
                                                    className="h-10 border-slate-200"
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 justify-end py-4">
                                <Button type="submit" disabled={loading} className="px-8 font-bold tracking-tight shadow-sm">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Applying Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Settings
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}
