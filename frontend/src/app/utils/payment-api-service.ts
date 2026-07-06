import { runtimeConfig } from "./runtime-config";

const ACCESS_TOKEN_KEY = "aarogya:accessToken";
const RAZORPAY_SCRIPT_ID = "aarogya-razorpay-checkout";
const FALLBACK_ACCESS_TOKEN = "local_public";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  paymentRecordId?: string;
}

export interface RazorpayPayment {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface FinalizedSubscriptionSummary {
  id: string;
  plan: string;
  amount: number;
  status: string;
  startDate: string;
  endDate?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
}

export interface FinalizedInvoiceSummary {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  issueDate: string;
  paidDate?: string | null;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  method: string;
  timestamp: string;
  receipt?: string;
  mode: "live" | "simulation";
  subscription?: FinalizedSubscriptionSummary;
  invoice?: FinalizedInvoiceSummary;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "succeeded" | "processing" | "requires_payment_method";
  client_secret: string;
}

export interface PaymentContext {
  userId?: string;
  planName?: string;
  durationMonths?: number;
}

class PaymentApiService {
  getMode(): "live" | "simulation" {
    return this.getPaymentBaseUrl() ? runtimeConfig.paymentMode : "simulation";
  }

  private getPaymentBaseUrl() {
    return runtimeConfig.paymentApiBaseUrl || runtimeConfig.apiBaseUrl;
  }

  private getAccessToken() {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY) || FALLBACK_ACCESS_TOKEN;
    } catch {
      return FALLBACK_ACCESS_TOKEN;
    }
  }

  private async postToGateway<T>(path: string, body: Record<string, unknown>) {
    const paymentBaseUrl = this.getPaymentBaseUrl();
    if (!paymentBaseUrl) return null;

    const response = await fetch(`${paymentBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Payment gateway request failed");
    }

    return (await response.json()) as T;
  }

  private async loadRazorpayCheckoutScript() {
    if (window.Razorpay) return true;

    const existing = document.getElementById(
      RAZORPAY_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existing) {
      return new Promise<boolean>((resolve) => {
        existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), {
          once: true,
        });
        existing.addEventListener("error", () => resolve(false), { once: true });
      });
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.id = RAZORPAY_SCRIPT_ID;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  private async openRazorpayCheckout(
    order: RazorpayOrder,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    },
    planName: string,
  ): Promise<RazorpayPayment> {
    const scriptLoaded = await this.loadRazorpayCheckoutScript();
    if (!scriptLoaded || !window.Razorpay || !runtimeConfig.razorpayKeyId) {
      throw new Error("Razorpay checkout is not available");
    }

    return new Promise<RazorpayPayment>((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: runtimeConfig.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Aarogya",
        description: `${planName} subscription`,
        prefill: userDetails,
        notes: {
          planName,
        },
        handler: (response: Record<string, unknown>) => {
          resolve({
            razorpay_payment_id: String(response.razorpay_payment_id ?? ""),
            razorpay_order_id: String(response.razorpay_order_id ?? order.id),
            razorpay_signature: String(response.razorpay_signature ?? ""),
          });
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      });

      checkout.open();
    });
  }

  async createRazorpayOrder(
    amount: number,
    currency = "INR",
    context?: PaymentContext,
  ): Promise<RazorpayOrder> {
    if (this.getPaymentBaseUrl()) {
      const liveOrder = await this.postToGateway<{
        success: boolean;
        order: RazorpayOrder;
      }>("/payments/razorpay/orders", {
        amount,
        currency,
        userId: context?.userId,
        planName: context?.planName,
        durationMonths: context?.durationMonths,
      });
      if (liveOrder?.order) return liveOrder.order;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 400));

    return {
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      status: "created",
    };
  }

  async initiateRazorpayPayment(
    order: RazorpayOrder,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    },
    planName: string,
    context?: PaymentContext,
  ): Promise<PaymentResult> {
    if (
      this.getPaymentBaseUrl() &&
      runtimeConfig.razorpayKeyId
    ) {
      const checkoutPayment = await this.openRazorpayCheckout(
        order,
        userDetails,
        planName,
      );
      const verifiedPayment = await this.postToGateway<PaymentResult>(
        "/payments/razorpay/verify",
        {
          payment: checkoutPayment,
          userId: context?.userId,
          planName,
          durationMonths: context?.durationMonths,
        },
      );

      if (verifiedPayment) return verifiedPayment;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1800));

    const simulatedPayment: RazorpayPayment = {
      razorpay_payment_id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      razorpay_order_id: order.id,
      razorpay_signature: this.generateSignature(order.id),
    };

    return {
      success: true,
      transactionId: simulatedPayment.razorpay_payment_id,
      orderId: simulatedPayment.razorpay_order_id,
      amount: order.amount / 100,
      method: "Razorpay",
      timestamp: new Date().toISOString(),
      receipt: order.receipt,
      mode: "simulation",
      subscription: context?.planName
        ? {
            id: `subscription_${Date.now()}`,
            plan: context.planName,
            amount: order.amount / 100,
            status: "active",
            startDate: new Date().toISOString(),
            endDate: this.addMonths(
              new Date(),
              context.durationMonths ?? 1,
            ).toISOString(),
            paymentMethod: "Razorpay",
            transactionId: simulatedPayment.razorpay_payment_id,
          }
        : undefined,
    };
  }

  async verifyRazorpaySignature(payment: RazorpayPayment): Promise<boolean> {
    if (this.getPaymentBaseUrl()) {
      const response = await this.postToGateway<{ success?: boolean }>(
        "/payments/razorpay/verify",
        { payment },
      );
      if (response) return Boolean(response.success);
    }

    await new Promise((resolve) => window.setTimeout(resolve, 200));
    return true;
  }

  async createStripePaymentIntent(
    amount: number,
    currency = "USD",
  ): Promise<StripePaymentIntent> {
    if (this.getPaymentBaseUrl()) {
      const intent = await this.postToGateway<StripePaymentIntent>(
        "/payments/stripe/intents",
        { amount, currency },
      );
      if (intent) return intent;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 500));

    const intentId = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return {
      id: intentId,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: "succeeded",
      client_secret: `${intentId}_secret_${Math.random().toString(36).slice(2, 10)}`,
    };
  }

  async confirmStripePayment(paymentIntentId: string): Promise<PaymentResult> {
    if (this.getPaymentBaseUrl()) {
      const payment = await this.postToGateway<PaymentResult>(
        "/payments/stripe/confirm",
        { paymentIntentId },
      );
      if (payment) return payment;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    return {
      success: true,
      transactionId: paymentIntentId,
      orderId: `order_${Date.now()}`,
      amount: 9.99,
      method: "Stripe",
      timestamp: new Date().toISOString(),
      mode: "simulation",
    };
  }

  getUPIOptions(): Array<{ id: string; name: string; icon: string }> {
    return [
      { id: "phonepe", name: "PhonePe", icon: "UPI" },
      { id: "googlepay", name: "Google Pay", icon: "UPI" },
      { id: "paytm", name: "Paytm", icon: "Wallet" },
      { id: "bhim", name: "BHIM UPI", icon: "UPI" },
      { id: "amazonpay", name: "Amazon Pay", icon: "Wallet" },
    ];
  }

  async processUPIPayment(
    upiId: string,
    amount: number,
    planName: string,
    context?: PaymentContext,
  ): Promise<PaymentResult> {
    if (this.getPaymentBaseUrl()) {
      const payment = await this.postToGateway<PaymentResult>(
        "/payments/upi/collect",
        {
          upiId,
          amount,
          planName,
          userId: context?.userId,
          durationMonths: context?.durationMonths,
        },
      );
      if (payment) return payment;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 2200));

    return {
      success: true,
      transactionId: `UPI${Date.now()}${Math.floor(Math.random() * 1000)}`,
      orderId: `ORD${Date.now()}`,
      amount,
      method: `UPI (${upiId})`,
      timestamp: new Date().toISOString(),
      mode: "simulation",
      subscription: {
        id: `subscription_${Date.now()}`,
        plan: planName,
        amount,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: this.addMonths(
          new Date(),
          context?.durationMonths ?? 1,
        ).toISOString(),
        paymentMethod: `UPI (${upiId})`,
        transactionId: `UPI${Date.now()}`,
      },
    };
  }

  async handleRazorpayWebhook(event: { event: string }) {
    console.log("Razorpay webhook event:", event.event);
  }

  private addMonths(date: Date, months: number) {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() + months);
    return copy;
  }

  private generateSignature(orderId: string): string {
    const payload = `${orderId}_${Date.now()}`;
    try {
      return window.btoa(payload);
    } catch {
      return payload;
    }
  }

  formatAmount(amount: number, currency = "INR"): string {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  getPaymentMethodIcon(method: string): string {
    const methodLower = method.toLowerCase();
    if (methodLower.includes("upi")) return "UPI";
    if (methodLower.includes("card")) return "CARD";
    if (methodLower.includes("bank")) return "BANK";
    if (methodLower.includes("wallet")) return "WALLET";
    return "PAY";
  }

  async generateInvoice(
    paymentResult: PaymentResult,
    userDetails: Record<string, unknown>,
    planDetails: Record<string, unknown>,
  ) {
    await new Promise((resolve) => window.setTimeout(resolve, 300));

    return {
      invoiceNumber: `INV-${Date.now()}`,
      transactionId: paymentResult.transactionId,
      date: new Date().toISOString(),
      user: userDetails,
      plan: planDetails,
      amount: paymentResult.amount,
      tax: paymentResult.amount * 0.18,
      total: paymentResult.amount * 1.18,
      status: "paid",
    };
  }
}

export const paymentApiService = new PaymentApiService();
