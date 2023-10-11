import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { charityCategoriesStub } from '@/stubs/charityCategories';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getUser, kycUser } from '@/lib/api';
import { useRouter } from 'next/router';

const formSchema = z.object({
  uen: z.string().nonempty({ message: 'UEN is required' }),
  name: z.string().nonempty({ message: 'Charity name is required' }),
  category: z.string().nonempty({ message: 'Category is required' }),
});

const index = () => {
  const [isKycCompleted, setKycCompleted] = useState(false);
  const [categoryIsOpen, setCategoryOpen] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchUser = async (email: string) => {
      const user = await getUser(email);
      console.log('FETCHED USER!!!!!!!!!!');
      console.log(user);

      if (user.isKyc) {
        setKycCompleted(true);
      }
    };

    if (session && session.user && session.user.email) {
      fetchUser(session.user.email);
    }
  }, [session]);

  const router = useRouter();
  const { email } = router.query;
  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uen: '',
      name: '',
      category: '',
    },
    mode: 'all',
  });

  const onSubmit = async ({
    name,
    uen,
    category,
  }: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(email, name, uen, category);
    console.log('kyc-ing user....', {
      email,
      name,
      uen,
      category,
    });
    const res = await kycUser(email as string, name, uen, category);
    console.log('success!', res);
    setKycCompleted(true);
  };

  const KYCCompleted = () => {
    return (
      <div>
        <p>Successfully completed KYC!</p>
        <Button onClick={() => router.push('/')}>Return to Home</Button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="pt-16 w-full flex justify-center">
        <div className="flex flex-col gap-4 w-[45vh]">
          <h1 className="text-4xl font-bold mb-4">Complete KYC</h1>
          {isKycCompleted ? (
            <KYCCompleted />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 "
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charity Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dreams Collective" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your organisation's registered name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="uen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unique Entity Number (UEN)</FormLabel>
                        <FormControl>
                          <Input placeholder="100000800R" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Category</FormLabel>
                        <Popover
                          open={categoryIsOpen}
                          onOpenChange={setCategoryOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value
                                  ? charityCategoriesStub.find(
                                      (category) =>
                                        category.value === field.value
                                    )?.label
                                  : 'Select category'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search categories..." />
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup className="max-h-60 overflow-y-auto">
                                {charityCategoriesStub.map((category) => (
                                  <CommandItem
                                    value={category.label}
                                    key={category.value}
                                    onSelect={() => {
                                      form.setValue('category', category.value);
                                      setCategoryOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        category.value === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {category.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Your organisation's impact domain
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="apple@minds.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Please use your organisation's email.
                      </FormDescription>
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
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                  {/* <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                </div>
                <Button type="submit">
                  {form.formState.isSubmitting ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      <p>Please wait</p>
                    </>
                  ) : (
                    <p>Submit</p>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default index;
