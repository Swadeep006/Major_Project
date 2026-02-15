import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from '@startlinks/react-native-toast';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [roleType, setRoleType] = useState<'student' | 'employee'>('student');
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Student Fields
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [yearSection, setYearSection] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Employee Fields
  const [employeeId, setEmployeeId] = useState('');
  const [empRole, setEmpRole] = useState<'incharge' | 'hod' | 'security'>('incharge');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error('Validation Error: Please fill all basic details');
      return;
    }

    setLoading(true);
    try {
      if (roleType === 'student') {
        await api.studentSignup({
          email,
          password,
          name,
          rollNumber: rollNo,
          department,
          yearSection,
          studentPhone: phone,
          parentPhone
        });
      } else {
        await api.employeeSignup({
          email,
          password,
          name,
          employeeId,
          role: empRole,
          department,
          phone
        });
      }
      toast.success('Registration Successful. Please login.');
      setTimeout(() => router.replace('/'), 1500);
    } catch (error: any) {
      toast.error('Registration Failed: ' + (error.message || 'Error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-4 pt-10">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="py-6">
          <Text className="text-3xl font-bold text-center text-primary">Join UniACE</Text>
          <Text className="text-center text-muted-foreground mt-2">Create your account to get started</Text>
        </View>

        {/* Role Type Selector */}
        <View className="flex-row bg-muted/20 p-1 rounded-lg mb-6">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${roleType === 'student' ? 'bg-background shadow-sm' : ''}`}
            onPress={() => setRoleType('student')}
          >
            <Text className={`text-center font-bold ${roleType === 'student' ? 'text-primary' : 'text-muted-foreground'}`}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${roleType === 'employee' ? 'bg-background shadow-sm' : ''}`}
            onPress={() => setRoleType('employee')}
          >
            <Text className={`text-center font-bold ${roleType === 'employee' ? 'text-primary' : 'text-muted-foreground'}`}>Employee</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <CardContent className="gap-4 pt-6">
            {/* Common Fields */}
            <View className="gap-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" value={name} onChangeText={setName} />
            </View>
            <View className="gap-2">
              <Label>Email</Label>
              <Input placeholder="john@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>
            <View className="gap-2">
              <Label>Password</Label>
              <Input placeholder="******" value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            {roleType === 'student' ? (
              <>
                <View className="gap-2">
                  <Label>Roll Number</Label>
                  <Input placeholder="22AG1A..." value={rollNo} onChangeText={setRollNo} autoCapitalize="characters" />
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-1 gap-2">
                    <Label>Department</Label>
                    <Input placeholder="CSE" value={department} onChangeText={setDepartment} autoCapitalize="characters" />
                  </View>
                  <View className="flex-1 gap-2">
                    <Label>Year & Section</Label>
                    <Input placeholder="IV-A" value={yearSection} onChangeText={setYearSection} />
                  </View>
                </View>
                <View className="gap-2">
                  <Label>Student Phone</Label>
                  <Input placeholder="9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View className="gap-2">
                  <Label>Parent Phone</Label>
                  <Input placeholder="9876543210" value={parentPhone} onChangeText={setParentPhone} keyboardType="phone-pad" />
                </View>
              </>
            ) : (
              <>
                <View className="gap-2">
                  <Label>Employee ID</Label>
                  <Input placeholder="EMP001" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" />
                </View>

                <View className="gap-2">
                  <Label>Role</Label>
                  <View className="flex-row gap-2 flex-wrap">
                    {['incharge', 'hod', 'security'].map((r) => (
                      <TouchableOpacity
                        key={r}
                        onPress={() => setEmpRole(r as any)}
                        className={`px-3 py-2 rounded border ${empRole === r ? 'bg-primary border-primary' : 'border-border bg-background'}`}
                      >
                        <Text className={empRole === r ? 'text-primary-foreground font-bold' : 'text-foreground capitalize'}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="gap-2">
                  <Label>Department</Label>
                  <Input placeholder="CSE (ignore for Security)" value={department} onChangeText={setDepartment} autoCapitalize="characters" />
                </View>
                <View className="gap-2">
                  <Label>Phone</Label>
                  <Input placeholder="9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
              </>
            )}

            <Button className="mt-4" onPress={handleRegister} disabled={loading}>
              <Text>{loading ? 'Creating Account...' : 'REGISTER'}</Text>
            </Button>

            <TouchableOpacity onPress={() => router.replace('/')} className="mt-4">
              <Text className="text-center text-sm text-primary">Already have an account? Login</Text>
            </TouchableOpacity>

          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}
