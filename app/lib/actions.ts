"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// example:
/* {
  customerId: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
  amount: '',
  status: 'pending'
} */
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Customer ID must be a string.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Amount must be greater than 0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Status must be either 'pending' or 'paid'.",
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  try {
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Missing Fields. Failed to Create Invoice.",
      };
    }

    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;
    // const date = new Date().toISOString().split("T")[0];

    console.log(customerId, amountInCents, status);
  } catch {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// ...

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });

    const amountInCents = amount * 100;

    console.log(customerId, status, amountInCents);

    // await sql`
    //   UPDATE invoices
    //   SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    //   WHERE id = ${id}
    // `;
  } catch {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  console.log(id);
  throw new Error("Failed to Delete Invoice");
  try {
    throw new Error("Failed to Delete Invoice");
    // await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted Invoice" };
  } catch {
    return {
      message: "Database Error: Failed to Delete Invoice.",
    };
  }
}
