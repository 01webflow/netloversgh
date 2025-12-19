import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaystackHookReturn {
  initializePayment: (params: {
    amount: number;
    email: string;
    userId: string;
    type: "wallet_topup" | "order_payment";
    orderId?: string;
  }) => Promise<void>;
  verifyPayment: (reference: string) => Promise<boolean>;
  loading: boolean;
}

export const usePaystack = (): PaystackHookReturn => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async (params: {
    amount: number;
    email: string;
    userId: string;
    type: "wallet_topup" | "order_payment";
    orderId?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: params,
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Store reference for verification
        sessionStorage.setItem("paystack_reference", data.reference);
        sessionStorage.setItem("paystack_type", params.type);
        
        // Redirect to Paystack
        window.location.href = data.authorization_url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error: unknown) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initialize payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Successful",
          description: data.type === "wallet_topup" 
            ? `GHS ${data.amount.toFixed(2)} has been added to your wallet`
            : "Your order payment has been confirmed",
        });
        return true;
      } else {
        toast({
          title: "Payment Failed",
          description: data?.message || "Payment verification failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: unknown) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { initializePayment, verifyPayment, loading };
};
