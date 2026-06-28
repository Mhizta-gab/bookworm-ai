import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/database/mongoose";
import UserSubscription from "@/database/models/user-subscription.model";

export async function POST(req: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Paystack secret key missing" }, { status: 500 });
    }

    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing x-paystack-signature header" }, { status: 400 });
    }

    const rawBody = await req.text();
    const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    if (hash !== signature) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success" || event.event === "subscription.create") {
      const { metadata, customer, subscription_code, reference } = event.data;
      const clerkId = metadata?.clerkId;
      const plan = metadata?.plan;

      if (clerkId && plan) {
        await connectDB();
        await UserSubscription.findOneAndUpdate(
          { clerkId },
          {
            $set: {
              plan,
              paystackCustomerCode: customer?.customer_code,
              paystackSubscriptionCode: subscription_code,
              paystackReference: reference,
              updatedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
        console.log(`Successfully upgraded user ${clerkId} to ${plan} plan via Paystack!`);
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
