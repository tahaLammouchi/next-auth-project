'use client';

import * as z from 'zod'
import { CardWrapper } from './card-wrapper'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@/lib/validations/index'
import { Input } from "@/components/ui/input"
import { useState, useTransition } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Button } from '@/components/ui/button';
import { FormError } from '../form-error';
import { FormSuccess } from '../form-success';
import { login } from '@/lib/actions/auth.actions';
import Link from 'next/link';

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email already in use" : "";

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const[error, setError] = useState<string | undefined>("")
  const[success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    if (showTwoFactor && !values.code) {
      setError("Two factor code is required");
      return;
    }

    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
            setSuccess("Two factor code sent to your email");
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <CardWrapper
    headerLabel="Welcome back"
    backButtonLabel="Don't have an account?"
    backButtonHref="/auth/register"
    showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((onSubmit))}
        className="space-y-6"
        >
          <div className="space-y-4">
          { showTwoFactor && (
              <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Two Factor Code</FormLabel>
                  <FormControl>
                    <Input
                    {...field}
                    disabled={isPending}
                    placeholder="123456"
                    type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
          )}
          { !showTwoFactor && (
            <>
              <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                    {...field}
                    disabled={isPending}
                    placeholder="youremail@example.com"
                    type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
              <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                    {...field}
                    disabled={isPending}
                    placeholder="********"
                    type="password"
                    />
                  </FormControl>
                  <Button
                  size="sm"
                  variant="link"
                  asChild
                  className="px-0 font-normal "
                  >
                    <Link href="/auth/reset">
                      Forget password?
                    </Link>
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
              />
            </>
            )
          }
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button
          disabled={isPending}
          type="submit"
          className='w-full'
          >
            { showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
