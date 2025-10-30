import { useState, type FC, useEffect, useCallback } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Typhography } from "@/components/ui/typhography";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRegisterEvent, useEventDetail, formatEvent } from "@/hooks";
import { useFlowCurrentUser, useFlowTransactionStatus } from "@onflow/react-sdk";
import { motion } from "motion/react";
import Galaxy from "@/components/Galaxy";
import { PageHeader } from "@/components/PageHeader";
import RegistrationForm from "./RegistrationForm";

const EventsFormPage: FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const navigate = useNavigate();
  const { user } = useFlowCurrentUser();
  const { data: event, isLoading: isLoadingEvent, error: eventError } = useEventDetail(+id);
  const { registerEvent, isPending, txId, error } = useRegisterEvent();
  const { transactionStatus } = useFlowTransactionStatus({ id: txId || "" });

  // Debug: Log event data when it changes
  useEffect(() => {
    if (event) {
      console.log("Event loaded:", {
        id: event.id,
        eventId: event.eventId,
        partnerAddress: event.edges?.partner?.address,
        partnerName: event.edges?.partner?.name,
        eventName: event.eventName,
      });
    }
  }, [event]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  // Watch transaction status and show success when sealed
  useEffect(() => {
    if (txId && transactionStatus?.status === 4) {
      // Status 4 = sealed (included in a block)
      setIsSubmitting(false);

      // Debug: Log the full transaction status
      console.log("Transaction sealed - Full status:", transactionStatus);

      // Check if transaction actually succeeded
      // Check for errorMessage first, then statusCode
      const hasError =
        transactionStatus.errorMessage ||
        (transactionStatus.statusCode !== undefined && transactionStatus.statusCode > 1);

      if (hasError) {
        // Transaction was sealed but failed - parse the error message
        const rawError = transactionStatus.errorMessage || "Transaction failed";

        // Try to extract the actual Cadence error message
        // Look for patterns like "error: pre-condition failed: [message]"
        let userFriendlyError = rawError;

        // Pattern 1: "error: pre-condition failed: [message]"
        const preConditionMatch = rawError.match(/error: pre-condition failed: (.+?)(?:\n|$)/);
        if (preConditionMatch) {
          userFriendlyError = preConditionMatch[1].trim();
        } else {
          // Pattern 2: "error: [message]" (general Cadence errors)
          const errorMatch = rawError.match(/error: (.+?)(?:\n|  -->|$)/);
          if (errorMatch) {
            userFriendlyError = errorMatch[1].trim();
          }
        }

        // Log full error for debugging
        console.error("Transaction failed:", {
          statusCode: transactionStatus.statusCode,
          rawError: rawError,
          parsedError: userFriendlyError,
          events: transactionStatus.events,
        });

        if (loadingToastId) {
          toast.error(userFriendlyError, { id: loadingToastId, duration: 10000 });
          setLoadingToastId(null);
        } else {
          toast.error(userFriendlyError, { duration: 10000 });
        }
      } else {
        // Transaction succeeded
        setIsSuccess(true);

        if (loadingToastId) {
          toast.success("Event registered successfully!", { id: loadingToastId });
          setLoadingToastId(null);
        } else {
          toast.success("Event registered successfully!");
        }
      }
    } else if (txId && transactionStatus?.status === 5) {
      // Status 5 = expired/unknown error
      setIsSubmitting(false);

      if (loadingToastId) {
        toast.error("Transaction expired or failed. Please try again.", { id: loadingToastId });
        setLoadingToastId(null);
      } else {
        toast.error("Transaction expired or failed. Please try again.");
      }
    }
  }, [transactionStatus, txId, loadingToastId]);

  const handleClickBack = useCallback(() => {
    router.history.back();
  }, [router]);

  const handleClickMyTicket = useCallback(() => {
    navigate({ to: `/` });
  }, [navigate]);

  const handleSubmit = useCallback(async (formData: { name: string; email: string; phoneNo: string }) => {

    // Check if user is logged in
    if (!user?.loggedIn) {
      toast.error("Please connect your wallet first!");
      return;
    }

    // Check if event data is loaded
    if (!event) {
      toast.error("Event data not found!");
      return;
    }

    // Get brand address from nested partner object
    const brandAddress = event.edges?.partner?.address;

    // Debug logging - Log full event object
    console.log("=== Registration Debug ===");
    console.log("Full event data:", JSON.stringify(event, null, 2));
    console.log("Partner object:", event.edges?.partner);
    console.log("Brand Address value:", brandAddress);
    console.log("Brand Address type:", typeof brandAddress);
    console.log("Brand Address empty?:", !brandAddress);
    console.log("Event ID:", event.eventId);
    console.log("Event ID type:", typeof event.eventId);
    console.log("User Address:", user.addr);
    console.log("========================");

    // Validate required fields
    if (!brandAddress || brandAddress.trim() === "") {
      toast.error("Event is missing partner/brand information. Please contact support.");
      console.error("Missing partner address in event:", event);
      return;
    }

    if (!event.eventId && event.eventId !== 0) {
      toast.error("Event is missing event ID. Please contact support.");
      console.error("Missing eventId in event:", event);
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute Cadence transaction to register user on-chain
      await registerEvent({
        brandAddress: brandAddress.trim(),
        eventID: event.eventId,
      });

      // Transaction submitted successfully - show loading toast with ID
      const toastId = toast.loading("Processing registration on blockchain...");
      setLoadingToastId(toastId);
      // Success will be handled by useEffect watching transactionStatus
    } catch (err) {
      setIsSubmitting(false);
      console.error("Registration error:", err);

      // More detailed error message
      const errorMessage = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null
        ? JSON.stringify(err)
        : "Failed to register. Please try again.";

      toast.error(errorMessage);
    }
  }, [user, event, registerEvent]);

  if (isSuccess) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="min-h-screen bg-background relative isolate flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 -z-1">
          <Galaxy />
        </div>

        <div className="bg-background/10 backdrop-blur-lg border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-6 flex flex-col">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/20 backdrop-blur-sm">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
          </div>

          <Typhography variant="3xl" className="font-bold">
            Registration Successful!
          </Typhography>

          <Typhography variant="lg" className="text-muted-foreground">
            Your ticket has been generated and saved to your wallet.
          </Typhography>

          {/* Transaction Link */}
          {txId && (
            <a
              href={`https://testnet.flowscan.io/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Typhography variant="t1" className="font-mono">
                {txId.slice(0, 8)}...{txId.slice(-6)}
              </Typhography>
              <ExternalLink size={14} />
            </a>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleClickMyTicket} size="lg" className="w-full">
              <Typhography variant="lg">View My Tickets</Typhography>
            </Button>
            <Button onClick={handleClickMyTicket} size="lg" variant="outline" className="w-full">
              <Typhography variant="lg">Back to Home</Typhography>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show loading state while fetching event
  if (isLoadingEvent) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="min-h-screen bg-background relative isolate flex items-center justify-center"
      >
        <div className="absolute inset-0 -z-1">
          <Galaxy />
        </div>
        <div className="text-center">
          <Spinner />
          <Typhography variant="2xl" className="mt-4 text-muted-foreground">
            Loading event details...
          </Typhography>
        </div>
      </motion.div>
    );
  }

  // Show error if event fetch failed
  if (eventError) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="min-h-screen bg-background relative isolate flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 -z-1">
          <Galaxy />
        </div>
        <div className="bg-background/10 backdrop-blur-lg border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <Typhography variant="2xl" className="text-destructive">
            Failed to load event details
          </Typhography>
          <Typhography variant="lg" className="text-muted-foreground">
            {eventError instanceof Error ? eventError.message : "Unknown error"}
          </Typhography>
          <Button onClick={handleClickBack} size="lg" className="w-full mt-4">
            Go Back
          </Button>
        </div>
      </motion.div>
    );
  }

  const formattedEvent = event ? formatEvent(event) : null;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      className="min-h-screen bg-background relative isolate"
    >
      <div className="absolute inset-0 -z-1">
        <Galaxy />
      </div>

      {/* Header with back button */}
      <PageHeader showLogo />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <RegistrationForm
          eventName={formattedEvent?.eventName}
          isSubmitting={isSubmitting}
          isLoggedIn={!!user?.loggedIn}
          onSubmit={handleSubmit}
          onCancel={handleClickBack}
        />
      </div>
    </motion.div>
  );
};

export default EventsFormPage;
