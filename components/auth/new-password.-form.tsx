'use client';

import * as z from 'zod'
import { CardWrapper } from './card-wrapper'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewPasswordSchema } from '@/lib/validations/index'
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
import { newPassword, reset } from '@/lib/actions/auth.actions';
import { useSearchParams } from 'next/navigation';


export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const[error, setError] = useState<string | undefined>("")
  const[success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  })

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");


    if (values.password !== values.confirmPassword) {
        setError("Passwords do not match");
        return; 
      }

      
      if(!token) {
        setError("Missing token!");
        return;
      }

    startTransition(() => {
      newPassword(values, token)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        });
    });
  };

  return (
    <CardWrapper
    headerLabel="Reset your password ?"
    backButtonLabel="Back to login"
    backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((onSubmit))}
        className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                  {...field}
                  disabled={isPending}
                  placeholder="******"
                  type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input
                  {...field}
                  disabled={isPending}
                  placeholder="********"
                  type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className='w-full'
          >
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
