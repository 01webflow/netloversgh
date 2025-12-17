import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAgentStatus = () => {
  const { user } = useAuth();
  const [isApprovedAgent, setIsApprovedAgent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAgentStatus = async () => {
      if (!user) {
        setIsApprovedAgent(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("agents")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking agent status:", error);
          setIsApprovedAgent(false);
        } else {
          setIsApprovedAgent(data?.status === "approved");
        }
      } catch (err) {
        console.error("Error checking agent status:", err);
        setIsApprovedAgent(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAgentStatus();
  }, [user]);

  return { isApprovedAgent, isLoading };
};
