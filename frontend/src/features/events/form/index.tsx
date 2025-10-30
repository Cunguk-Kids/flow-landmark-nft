import { useState, type FC, type FormEvent, useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typhography } from "@/components/ui/typhography";
import { Phone, Mail, User, CheckCircle2 } from "lucide-react";
import {
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRegisterEvent, useEventDetail, formatEvent } from "@/hooks";
import { useFlowCurrentUser, useFlowTransactionStatus } from "@onflow/react-sdk";
import { motion } from "motion/react";
import Galaxy from "@/components/Galaxy";
import { PageHeader } from "@/components/PageHeader";

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

  const [formData, setFormData] = useState({
    id: id,
    name: "",
    email: "",
    phoneNo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  // Watch transaction status and show success when sealed
  useEffect(() => {
    if (txId && transactionStatus?.status === 4) {
      // Status 4 = sealed (completed)
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        id: id,
        name: "",
        email: "",
        phoneNo: "",
      });

      // Dismiss loading toast and show success
      if (loadingToastId) {
        toast.success("Event registered successfully!", { id: loadingToastId });
        setLoadingToastId(null);
      } else {
        toast.success("Event registered successfully!");
      }
    } else if (txId && transactionStatus?.status === 5) {
      // Status 5 = error
      setIsSubmitting(false);

      // Dismiss loading toast and show error
      if (loadingToastId) {
        toast.error("Registration failed. Please try again.", { id: loadingToastId });
        setLoadingToastId(null);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  }, [transactionStatus, txId, id, loadingToastId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickBack = () => {
    router.history.back();
  };

  const handleClickMyTicket = () => {
    navigate({ to: `/` });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
  };

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

        <div className="bg-background/10 backdrop-blur-lg border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-6">
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-2 flex flex-col">
            <Typhography variant="3xl" className="font-bold">
              Event Registration
            </Typhography>
            {formattedEvent && (
              <Typhography variant="lg" className="text-muted-foreground">
                {formattedEvent.eventName}
              </Typhography>
            )}
          </div>

          {/* Wallet Connection Warning */}
          {!user?.loggedIn && (
            <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6">
              <Typhography variant="lg" className="text-muted-foreground text-center">
                Please connect your wallet to register for this event
              </Typhography>
            </div>
          )}

          {/* Registration Form Card */}
          <div className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-6">
            <Typhography variant="lg" className="font-semibold text-center block">
              Your Information
            </Typhography>

            {/* Name Field */}
            <div className="space-y-2">
              <FieldLabel htmlFor="name" className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <Typhography variant="lg">
                  Full Name<span className="text-destructive ml-1">*</span>
                </Typhography>
              </FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="off"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="bg-background/50 backdrop-blur-sm"
                max={50}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <FieldLabel htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                <Typhography variant="lg">
                  Email Address<span className="text-destructive ml-1">*</span>
                </Typhography>
              </FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="off"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="bg-background/50 backdrop-blur-sm"
                max={50}
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <FieldLabel htmlFor="phoneNo" className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground" />
                <Typhography variant="lg">
                  Phone Number<span className="text-destructive ml-1">*</span>
                </Typhography>
              </FieldLabel>
              <Input
                id="phoneNo"
                type="tel"
                name="phoneNo"
                autoComplete="off"
                required
                value={formData.phoneNo}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="bg-background/50 backdrop-blur-sm"
                maxLength={20}
                minLength={5}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClickBack}
              type="button"
              variant="outline"
              className="flex-1"
            >
              <Typhography variant="lg">Cancel</Typhography>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !user?.loggedIn}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <Typhography variant="lg">Processing...</Typhography>
                </>
              ) : !user?.loggedIn ? (
                <Typhography variant="lg">Connect Wallet First</Typhography>
              ) : (
                <Typhography variant="lg">Complete Registration</Typhography>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EventsFormPage;
