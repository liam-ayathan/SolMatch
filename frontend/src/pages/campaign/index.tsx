import React from "react";
import { useRouter } from 'next/router'; // Import useRouter from Next.js
import { cn } from "@/lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";

import { campaignCategoriesStub } from "@/stubs/campaignCategories";``
import { suppliersStub } from "@/stubs/suppliers";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().nonempty({ message: "Campaign name is required" }),
  category: z.string().nonempty({ message: "Category is required" }),
  endDate: z.string().refine((value) => !isNaN(parseInt(value)), {
    message: "End Date is required",
  }),
  description: z.string().nonempty({ message: "Description is required" }),
  targetAmount: z.string(),
  commitments: z
    .array(
      z.object({
        supplier: z
          .string()
          .refine((value) => suppliersStub.map((s) => s.value).includes(value)), // Validate supplier value
        percentage: z
          .number()
          .int()
          .min(0, { message: "Percentage must be a positive integer" })
          .max(100, { message: "Percentage cannot exceed 100%" }),
      })
    )
    .refine(
      (value) =>
        value.reduce(
          (total, commitment) => total + commitment.percentage,
          0
        ) === 100
    ),
});

const index = () => {
  const [categoryIsOpen, setCategoryOpen] = React.useState(false);
  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      endDate: "1", // Initialize with null value for date fields
      description: "",
      targetAmount: "0",
      commitments: [{ supplier: "", percentage: 0 }], // Initialize with the first supplier
    },
    mode: "all",
  });

  const [supplierIsOpen, setSupplierOpen] = React.useState(
    Array(1).fill(false) // Initialize with the first supplier
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "commitments",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);

    let inputCommitments = values.commitments.map((commitment) => {
      return {
        supplier: commitment.supplier,
        percentage: commitment.percentage,
        fulfilled: false,
      };
    });

    let input = {
      title: values.name,
      category: values.category,
      start: new Date(),
      end: values.endDate,
      description: values.description,
      targetAmount: values.targetAmount,
      currentAmount: 0,
      commitment: inputCommitments,
      charity: "charity",
      image: "/donate.jpg",
    };

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        const newCampaign = await response.json();
        console.log("Campaign created successfully:", newCampaign);
        // You can redirect the user or perform any other actions here
      } else {
        const errorData = await response.json();
        console.error("Error creating campaign:", errorData);
        // Handle the error, display a message to the user, etc.
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle network errors or other exceptions here
    }
  }

  // function onSubmit(values: z.infer<typeof formSchema>) {

  //   // submit to nextjs api route

  // }
  const router = useRouter(); // Initialize the useRouter hook

  return (
    <Layout>
      <div className="pt-16 w-full flex justify-center">
        <div className="flex flex-col gap-4 w-[45vh]">
          <h1 className="text-4xl font-bold mb-4">Create Campaign</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rainforest Restoration"
                          {...field}
                        />
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
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? campaignCategoriesStub.find(
                                    (category) => category.value === field.value
                                  )?.label
                                : "Select category"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {campaignCategoriesStub.map((category) => (
                                <CommandItem
                                  value={category.label}
                                  key={category.value}
                                  onSelect={() => {
                                    form.setValue("category", category.value);
                                    setCategoryOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      category.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
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

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter campaign description"
                          {...field}
                          multiline // If you want a multiline input
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Target Amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {fields.map((commitment, index) => (
                  <div key={commitment.id} className="space-y-4">
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name={`commitments.${index}.supplier`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Supplier</FormLabel>
                            <Popover
                              open={supplierIsOpen[index]}
                              onOpenChange={(isOpen) => {
                                const updatedSupplierOpen = [...supplierIsOpen];
                                updatedSupplierOpen[index] = isOpen;
                                setSupplierOpen(updatedSupplierOpen);
                              }}
                            >
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? suppliersStub.find(
                                          (supplier) =>
                                            supplier.value === field.value
                                        )?.label
                                      : "Select supplier"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search suppliers..." />
                                  <CommandEmpty>
                                    No supplier found.
                                  </CommandEmpty>
                                  <CommandGroup className="max-h-60 overflow-y-auto">
                                    {suppliersStub.map((supplier) => (
                                      <CommandItem
                                        value={supplier.label}
                                        key={supplier.value}
                                        onSelect={() => {
                                          form.setValue(
                                            `commitments.${index}.supplier`,
                                            supplier.value
                                          );
                                          const updatedSupplierOpen = [
                                            ...supplierIsOpen,
                                          ];
                                          updatedSupplierOpen[index] = false;
                                          setSupplierOpen(updatedSupplierOpen);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            supplier.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {supplier.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Your selected supplier
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`commitments.${index}.percentage`}
                        render={({ field }) => (
                          <div className="flex-grow">
                            <FormLabel>Percentage</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Percentage"
                                {...field}
                                min="0"
                                max="100"
                                onChange={(e) => {
                                  // Parse the input value as a float
                                  const parsedValue = parseFloat(
                                    e.target.value
                                  );

                                  // Check if the parsed value is a valid number
                                  if (!isNaN(parsedValue)) {
                                    // Set the parsed value as the field value
                                    field.onChange(parsedValue);
                                  } else {
                                    // If the input is not a valid number, you can handle it here
                                    // For example, you can display an error message or prevent it from being set
                                    // field.onChange(""); // Clear the field value or handle the error as needed
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={() =>
                    append(
                      { supplier: "", percentage: 0 },
                      { shouldFocus: true }
                    )
                  }
                >
                  Add Commitment
                </Button>
              </div>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  onSubmit(form.getValues());
                  router.push(`/`);
                }}
              >
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
        </div>
      </div>
    </Layout>
  );
};

export default index;
