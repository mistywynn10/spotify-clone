"use client";

import { Subscription, UserDetails } from "@/types";
import {
  useSessionContext,
  useUser as useSupabaseUser,
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

export const MyUserContextProvider = ({ children }: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient,
  } = useSessionContext();

  const user = useSupabaseUser();
  const accessToken = session?.access_token ?? null;

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!user) {
      setUserDetails(null);
      setSubscription(null);
      setIsLoadingData(false);
      return;
    }

    const loadUserData = async () => {
      setIsLoadingData(true);

      console.log("Loading data for user:", user.id);

      try {
        const userDetailsResult = await supabaseClient
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const subscriptionResult = await supabaseClient
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created", { ascending: false });

        console.log("Logged-in user ID:", user.id);
        console.log(
          "Every subscription visible to this user:",
          subscriptionResult.data,
        );
        console.log("Subscription query error:", subscriptionResult.error);

        console.log("Raw subscription data:", subscriptionResult.data);

        console.log("Raw subscription error:", subscriptionResult.error);

        if (subscriptionResult.error) {
          throw subscriptionResult.error;
        }

        const activeSubscription =
          subscriptionResult.data?.find(
            (item) => item.status === "active" || item.status === "trialing",
          ) ?? null;

        console.log("Active subscription selected:", activeSubscription);

        if (!activeSubscription) {
          console.log("No active or trialing subscription was found.");

          setUserDetails(userDetailsResult.data as UserDetails | null);

          setSubscription(null);
          return;
        }

        const priceResult = await supabaseClient
          .from("prices")
          .select("*")
          .eq("id", activeSubscription.price_id)
          .maybeSingle();

        let product = null;

        if (priceResult.data?.product_id) {
          const productResult = await supabaseClient
            .from("products")
            .select("*")
            .eq("id", priceResult.data.product_id)
            .maybeSingle();

          product = productResult.data;
        }

        const completeSubscription = {
          ...activeSubscription,
          prices: priceResult.data
            ? {
                ...priceResult.data,
                products: product,
              }
            : null,
        };

        console.log(
          "Complete subscription before state:",
          completeSubscription,
        );

        setUserDetails(userDetailsResult.data as UserDetails | null);

        setSubscription(completeSubscription as Subscription);
      } catch (error) {
        console.error("Failed to load subscription:", error);

        setSubscription(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [user?.id, isLoadingUser]);

  return (
    <UserContext.Provider
      value={{
        accessToken,
        user,
        userDetails,
        subscription,
        isLoading: isLoadingUser || isLoadingData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used inside MyUserContextProvider");
  }

  return context;
};
