import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">UniACE</span>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {/* Navigation Links based on role could go here */}
                    <span className="text-sm font-medium text-muted-foreground capitalize">{user?.role} Portal</span>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="mr-4 hidden sm:block text-right">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    
                    <Button variant="ghost" className='border' size="icon" onClick={() => navigate(`/${user?.role}/profile`)}>
                        <UserIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" className='border' size="icon" onClick={async () => { await logout(); navigate('/login'); }}>
                        <LogOut className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
