'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { GraduationCap, ShieldCheck, Lock, Loader2, RefreshCw } from 'lucide-react';

const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error('Missing email address.');
      router.push('/forgot-password');
    }
  }, [email, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await authService.resetPassword({
        email,
        otp: data.otp,
        new_password: data.new_password,
      });
      if (response.success) {
        toast.success('Password reset successfully! Please login.');
        router.push('/login');
      }
    } catch (error: any) {
      toast.error(error || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResending(true);
    try {
      const response = await authService.resendOtp({
        email,
        type: 'FORGOT_PASSWORD',
      });
      if (response.success) {
        toast.success('OTP resent successfully!');
      }
    } catch (error: any) {
      toast.error(error || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <Card className="w-full max-w-md shadow-lg border-primary/10">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="bg-primary/10 p-3 rounded-full mb-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter the OTP sent to <span className="font-medium text-foreground">{email}</span> and your new password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter 6-digit Code</Label>
            <Input
              id="otp"
              placeholder="123456"
              className="text-center text-2xl tracking-[1em] h-12"
              maxLength={6}
              {...register('otp')}
            />
            {errors.otp && (
              <p className="text-sm text-destructive text-center">{errors.otp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="new_password"
                type="password"
                className="pl-10"
                placeholder="••••••••"
                {...register('new_password')}
              />
            </div>
            {errors.new_password && (
              <p className="text-sm text-destructive">{errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm_password"
                type="password"
                className="pl-10"
                placeholder="••••••••"
                {...register('confirm_password')}
              />
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              {resending && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
              Resend OTP
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-lg border-primary/10 p-8 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      }>
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
