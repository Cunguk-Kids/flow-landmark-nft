import { useState, type FC, type FormEvent, useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typhography } from "@/components/ui/typhography";
import { ArrowLeft, Phone, X } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
} from "@/components/ui/item";
import { useRegisterEvent, useEventDetail } from "@/hooks";
import { useFlowCurrentUser, useFlowTransactionStatus } from "@onflow/react-sdk";

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
      <ItemGroup className="p-6 text-center">
        <ItemContent>
          <ItemHeader className="font-semibold self-center">
            <Typhography variant="3xl">Register Success</Typhography>
          </ItemHeader>
          <ItemDescription className="text-muted-foreground my-8">
            <Typhography variant="2xl">
              Your ticket can be viewed on My Ticket
            </Typhography>
          </ItemDescription>
          <ItemFooter className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Button onClick={handleClickMyTicket} className="flex-1 w-full">
              <Typhography variant="lg">My Ticket</Typhography>
            </Button>
            <Button
              variant={"secondary"}
              onClick={handleClickMyTicket}
              className="flex-1 w-full"
            >
              <Typhography variant="lg">Home</Typhography>
            </Button>
          </ItemFooter>
        </ItemContent>
      </ItemGroup>
    );
  }

  // Show loading state while fetching event
  if (isLoadingEvent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner />
          <Typhography variant="2xl" className="mt-4 text-muted-foreground">
            Loading event details...
          </Typhography>
        </div>
      </div>
    );
  }

  // Show error if event fetch failed
  if (eventError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center p-6">
          <Typhography variant="2xl" className="text-destructive">
            Failed to load event details
          </Typhography>
          <Typhography variant="lg" className="text-muted-foreground mt-2">
            {eventError instanceof Error ? eventError.message : "Unknown error"}
          </Typhography>
          <Button onClick={handleClickBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="min-h-screen text-foreground">
      <FieldSet className="w-full py-2 px-6 flex flex-col justify-center items-center">
        <div className="w-full flex justify-between items-center gap-2">
          <Button
            onClick={handleClickBack}
            size={"icon-sm"}
            variant={"outline"}
            className="rounded-full"
          >
            <ArrowLeft />
          </Button>
          <Typhography variant="3xl" className="font-bold">
            Registration Form
          </Typhography>
        </div>

        {/* Debug Info - Remove in production */}
        {event && (
          <div className="w-full my-2 p-2 bg-muted/50 rounded text-xs">
            <Typhography variant="t3" className="text-muted-foreground">
              Event: {event.eventName} (ID: {event.eventId})
              <br />
              Partner: {event.edges?.partner?.name || "Unknown"}
              <br />
              Brand Address: {event.edges?.partner?.address || "⚠️ MISSING"}
            </Typhography>
          </div>
        )}

        {!user?.loggedIn && (
          <div className="w-full my-4 p-4 bg-muted rounded-lg border border-border">
            <Typhography variant="lg" className="text-muted-foreground text-center">
              Please connect your wallet to register for this event
            </Typhography>
          </div>
        )}
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">
              <Typhography variant="lg">
                Name<span className="text-destructive">*</span>
              </Typhography>
            </FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="off"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              max={50}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">
              <Typhography variant="lg">
                Email<span className="text-destructive">*</span>
              </Typhography>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                name="email"
                autoComplete="off"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Active Email"
                max={50}
              />
              <InputGroupAddon>
                <Label htmlFor="email">@</Label>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="phoneNo">
              <Typhography variant="lg">
                Phone Number<span className="text-destructive">*</span>
              </Typhography>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="phoneNo"
                type="number"
                name="phoneNo"
                autoComplete="off"
                required
                value={formData.phoneNo}
                onChange={handleChange}
                placeholder="Your Phone Number"
                max={20}
                min={5}
              />
              <InputGroupAddon>
                <Label htmlFor="phoneNo">
                  <Phone size={16} />
                </Label>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Field orientation="responsive">
            <Button onClick={handleClickBack} type="button" variant="outline">
              <Typhography variant="lg">Cancel</Typhography>
            </Button>
            <Button
              type="submit"
              className={`${isSubmitting || !user?.loggedIn ? "cursor-not-allowed" : ""}`}
              disabled={isSubmitting || !user?.loggedIn}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <Typhography variant="lg">Processing...</Typhography>
                </>
              ) : !user?.loggedIn ? (
                <Typhography variant="lg">Connect Wallet First</Typhography>
              ) : (
                <Typhography variant="lg">Register</Typhography>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};

export default EventsFormPage;
