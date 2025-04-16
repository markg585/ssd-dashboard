'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success('Logged in');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-xl p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Login to SCSD</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


