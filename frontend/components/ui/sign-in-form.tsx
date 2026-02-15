import * as React from 'react';
import { Pressable, type TextInput, View } from 'react-native';
import { SocialConnections } from '@/components/ui/social-connections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';

interface SignInFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

// ✅ FIX 1: Destructure props using { onSubmit, isLoading }
export function SignInForm({ onSubmit, isLoading }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  // ✅ FIX 2: Call the prop function with local state data
  function handleSubmit() {
    if (!email || !password) return;
    onSubmit({ email, password });
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Sign in to your app</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                value={email}
                onChangeText={setEmail} // ✅ FIX 3: Capture email
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
              />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                value={password}
                onChangeText={setPassword} // ✅ FIX 4: Capture password
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Button className="w-full" onPress={handleSubmit} disabled={isLoading}>
              <Text>{isLoading ? 'Authenticating...' : 'Continue'}</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Don't have an account?{' '}
            <Pressable
              onPress={() => {
                router.push('/register');
              }}>
              <Text className="text-sm underline underline-offset-4">Sign Up</Text>
            </Pressable>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
