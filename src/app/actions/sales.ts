"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

type CartItem = {
  productId: string;
  batchId: string;
  quantity: number;
  price: number;
};

export async function processSale(
  items: CartItem[],
  totalAmount: number,
  paymentMethod: string,
) {
  if (!items.length) {
    return { success: false, message: "Cart is empty" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          paymentMethod,
          cashierId: session.user.id,
          items: {
            create: items.map((item: CartItem) => ({
              batchId: item.batchId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      for (const item of items) {
        const batch = await tx.batch.findUnique({
          where: { id: item.batchId },
        });
        if (!batch || batch.quantity < item.quantity) {
          throw new Error(`Insufficient stock for batch ${item.batchId}`);
        }

        await tx.batch.update({
          where: { id: item.batchId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }
    });
  } catch (error: any) {
    console.error("Sale Error:", error);
    return { success: false, message: error.message || "Transaction failed" };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/sales");
  return { success: true, message: "Sale completed successfully" };
}
