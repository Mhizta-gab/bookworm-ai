import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, currency = "NGN" } = await req.json();

    if (plan !== "standard" && plan !== "pro") {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const selectedCurrency = currency.toUpperCase() === "USD" ? "USD" : "NGN";

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Paystack secret key is not configured" }, { status: 500 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Amounts: USD in cents ($12 = 1200, $29 = 2900); NGN in kobo (₦12,000 = 1200000, ₦29,000 = 2900000)
    const amount =
      selectedCurrency === "USD"
        ? plan === "pro"
          ? 2900
          : 1200
        : plan === "pro"
          ? 2900000
          : 1200000;

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        amount,
        currency: selectedCurrency,
        callback_url: `${origin}/dashboard/billing?payment=success`,
        metadata: {
          clerkId: userId,
          plan,
          currency: selectedCurrency,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Failed to initialize transaction" }, { status: 400 });
    }

    return NextResponse.json({ authorization_url: data.data.authorization_url });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
