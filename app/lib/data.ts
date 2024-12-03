import { customers, invoices, revenue } from "./placeholder-data";

import { formatCurrency } from "./utils";

export async function fetchRevenue() {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("Data fetch completed after 3 seconds.");

    return revenue;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("Data fetch completed after 3 seconds.");

    const latestInvoices = invoices
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((invoice) => {
        const customer = customers.find((c) => c.id === invoice.customer_id);
        return {
          id: invoice.id,
          name: customer?.name ?? "Unknown",
          image_url: customer?.image_url ?? "",
          email: customer?.email ?? "unknown@example.com",
          amount: formatCurrency(invoice.amount),
        };
      });
    return latestInvoices;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Data fetch completed after 3 seconds.");

    const numberOfInvoices = invoices.length;
    const numberOfCustomers = customers.length;

    let totalPaidInvoices = 0;
    let totalPendingInvoices = 0;

    for (const inv of invoices) {
      if (inv.status === "paid") {
        totalPaidInvoices += inv.amount;
      } else if (inv.status === "pending") {
        totalPendingInvoices += inv.amount;
      }
    }

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices: formatCurrency(totalPaidInvoices),
      totalPendingInvoices: formatCurrency(totalPendingInvoices),
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const filteredInvoices = invoices
      .filter(
        (invoice) =>
          customers
            .find((c) => c.id === invoice.customer_id)
            ?.name.includes(query) ||
          customers
            .find((c) => c.id === invoice.customer_id)
            ?.email.includes(query) ||
          invoice.amount.toString().includes(query) ||
          invoice.date.includes(query) ||
          invoice.status.includes(query)
      )
      .slice(offset, offset + ITEMS_PER_PAGE)
      .map((invoice) => {
        const customer = customers.find((c) => c.id === invoice.customer_id);
        return {
          id: invoice.id,
          amount: invoice.amount,
          date: invoice.date,
          status: invoice.status,
          name: customer?.name,
          email: customer?.email,
          image_url: customer?.image_url,
        };
      });

    return filteredInvoices;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const filteredInvoicesCount = invoices.filter(
      (invoice) =>
        customers
          .find((c) => c.id === invoice.customer_id)
          ?.name.includes(query) ||
        customers
          .find((c) => c.id === invoice.customer_id)
          ?.email.includes(query) ||
        invoice.amount.toString().includes(query) ||
        invoice.date.includes(query) ||
        invoice.status.includes(query)
    ).length;

    const totalPages = Math.ceil(filteredInvoicesCount / 6);
    return totalPages;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return null;

    return {
      ...invoice,
      amount: invoice.amount / 100,
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
    }));
  } catch (err) {
    console.error("Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const filteredCustomers = customers
      .filter(
        (customer) =>
          customer.name.includes(query) || customer.email.includes(query)
      )
      .map((customer) => {
        const customerInvoices = invoices.filter(
          (inv) => inv.customer_id === customer.id
        );

        let totalPending = 0;
        let totalPaid = 0;

        for (const inv of customerInvoices) {
          if (inv.status === "pending") {
            totalPending += inv.amount;
          } else if (inv.status === "paid") {
            totalPaid += inv.amount;
          }
        }

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image_url: customer.image_url,
          total_invoices: customerInvoices.length,
          total_pending: formatCurrency(totalPending),
          total_paid: formatCurrency(totalPaid),
        };
      });

    return filteredCustomers;
  } catch (err) {
    console.error("Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}
