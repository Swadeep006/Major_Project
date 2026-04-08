import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Form states
    const [roleVisible, setRoleVisible] = useState<'student' | 'employee'>('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        rollNo: '',
        department: '',
        yearSection: '',
        parentPhone: '',
        employeeId: '',
        empRole: 'incharge' as 'incharge' | 'hod' | 'security'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (roleVisible === 'student') {
                await api.studentSignup({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    rollNumber: formData.rollNo,
                    department: formData.department,
                    yearSection: formData.yearSection,
                    studentPhone: formData.phone,
                    parentPhone: formData.parentPhone
                });
            } else {
                await api.employeeSignup({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    employeeId: formData.employeeId,
                    role: formData.empRole,
                    department: formData.department,
                    phone: formData.phone
                });
            }
            toast({
                title: "Registration Successful",
                description: "You can now login with your credentials.",
            });
            navigate('/login');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message || "An error occurred during registration.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12 relative">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Join the portal by filling in your details below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="student" className="w-full" onValueChange={(val) => setRoleVisible(val as any)}>
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="student">Student</TabsTrigger>
                            <TabsTrigger value="employee">Employee</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="e.g. John Doe" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="e.g. student@gmail.com" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input 
                                            id="password" 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="Create a strong password" 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            <span className="sr-only">Toggle password visibility</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} required />
                                </div>

                                <TabsContent value="student" className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 mt-0">
                                    <div className="space-y-2">
                                        <Label htmlFor="rollNo">Roll Number</Label>
                                        <Input id="rollNo" placeholder="e.g. 21AG1A0501" value={formData.rollNo} onChange={handleChange} required={roleVisible === 'student'} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input id="department" placeholder="e.g. CSE (AI&ML)" value={formData.department} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yearSection">Year & Section</Label>
                                        <Input id="yearSection" placeholder="e.g. III-A" value={formData.yearSection} onChange={handleChange} required={roleVisible === 'student'} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="parentPhone">Parent's Phone</Label>
                                        <Input id="parentPhone" placeholder="+91 9988776655" value={formData.parentPhone} onChange={handleChange} required={roleVisible === 'student'} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="employee" className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 mt-0">
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">Employee ID</Label>
                                        <Input id="employeeId" placeholder="e.g. ACE-EMP-045" value={formData.employeeId} onChange={handleChange} required={roleVisible === 'employee'} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="empRole">Role</Label>
                                        <Select value={formData.empRole} onValueChange={(val: any) => setFormData({...formData, empRole: val})}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="incharge">Incharge</SelectItem>
                                                <SelectItem value="hod">HOD</SelectItem>
                                                <SelectItem value="security">Security</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input id="department" placeholder="e.g. CSE (AI&ML)" value={formData.department} onChange={handleChange} required={formData.empRole !== 'security'} />
                                    </div>
                                </TabsContent>
                            </div>

                            <Button type="submit" className="w-full mt-6" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? "Creating Account..." : "Register Account"}
                            </Button>
                        </form>
                    </Tabs>
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-foreground underline underline-offset-4 hover:opacity-80">
                            Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
