"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  amount: number;
  jobId: string;
  action: "promote" | "feature";
  tier?: string;
  onSuccess: () => void | Promise<void>;
}

export function MpesaCheckoutDialog({
  open,
  onOpenChange,
  title,
  description,
  amount,
  jobId,
  action,
  tier,
  onSuccess,
}: CheckoutDialogProps) {
  const { user, session } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollStatus = useCallback(
    async (paymentId: string, accessToken: string) => {
      try {
        const res = await fetch(
          `/api/payments/mpesa/status?paymentId=${encodeURIComponent(paymentId)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const json = await res.json();
        if (!res.ok || !json.data) return;

        const data = json.data as {
          status: PaymentStatus;
          mpesa_receipt_number: string | null;
          result_desc: string | null;
        };
        setPaymentStatus(data.status);
        if (data.mpesa_receipt_number) setReceipt(data.mpesa_receipt_number);

        if (data.status === "SUCCESS") {
          stopPolling();
          toast.success(
            data.mpesa_receipt_number
              ? `Payment successful. Receipt: ${data.mpesa_receipt_number}`
              : "Payment successful"
          );
          await onSuccess();
        } else if (data.status === "FAILED" || data.status === "CANCELLED") {
          stopPolling();
          toast.error(data.result_desc || `Payment ${data.status.toLowerCase()}`);
        }
      } catch (err) {
        console.error("[M-Pesa] Status poll failed:", err);
      }
    },
    [stopPolling, onSuccess]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      toast.error("Please sign in to make a payment");
      return;
    }

    setSubmitting(true);
    setPaymentStatus(null);
    setReceipt(null);
    setTransactionRef(null);
    stopPolling();

    try {
      const res = await fetch("/api/payments/mpesa/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          jobId,
          action,
          tier,
          description: title,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to initiate payment");
      }

      const data = json.data as { paymentId: string; transactionReference: string };
      setTransactionRef(data.transactionReference);
      toast.success(json.message || "Check your phone for the M-Pesa prompt");

      let attempts = 0;
      pollRef.current = setInterval(() => {
        attempts += 1;
        if (attempts > 40) {
          stopPolling();
          toast.message(
            "Still waiting for confirmation. You can check the payment status later."
          );
          return;
        }
        void pollStatus(data.paymentId, session.access_token);
      }, 3000);

      void pollStatus(data.paymentId, session.access_token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    stopPolling();
    setSubmitting(false);
    setPaymentStatus(null);
    setReceipt(null);
    setTransactionRef(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount</p>
            <p className="text-3xl font-bold text-foreground">
              KES {amount.toLocaleString()}
            </p>
          </div>

          {transactionRef && (
            <p className="text-xs text-muted-foreground break-all">
              Reference: <span className="font-mono">{transactionRef}</span>
            </p>
          )}

          {paymentStatus === "SUCCESS" ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground space-y-1">
                <p className="font-medium">Payment successful</p>
                {receipt && <p className="text-muted-foreground">Receipt: {receipt}</p>}
                <p className="text-muted-foreground">
                  Your job has been {action === "promote" ? "promoted" : "featured"}.
                </p>
              </div>
            </div>
          ) : paymentStatus === "FAILED" || paymentStatus === "CANCELLED" ? (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground">
                <p className="font-medium">Payment {paymentStatus.toLowerCase()}</p>
                <p className="text-muted-foreground">
                  You can retry the payment if you wish.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesa-phone">M-Pesa phone number</Label>
                <Input
                  id="mpesa-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="07XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  autoComplete="tel"
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  You will receive an STK push prompt on this number to confirm the
                  payment.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending STK Push…
                  </>
                ) : (
                  `Pay KES ${amount.toLocaleString()}`
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
