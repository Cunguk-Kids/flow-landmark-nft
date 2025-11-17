import { useState, memo, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typhography } from "@/components/ui/typhography";
import { Phone, Mail, User } from "lucide-react";
import { FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

interface RegistrationFormProps {
  eventName?: string;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  onSubmit: (formData: { name: string; email: string; phoneNo: string }) => void;
  onCancel: () => void;
}

const RegistrationForm = memo(({
  eventName,
  isSubmitting,
  isLoggedIn,
  onSubmit,
  onCancel,
}: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2 flex flex-col">
        <Typhography variant="3xl" className="font-bold">
          Event Registration
        </Typhography>
        {eventName && (
          <Typhography variant="lg" className="text-muted-foreground">
            {eventName}
          </Typhography>
        )}
      </div>

      {/* Wallet Connection Warning */}
      {!isLoggedIn && (
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
            maxLength={50}
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
            maxLength={50}
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
          onClick={onCancel}
          type="button"
          variant="outline"
          className="flex-1"
        >
          <Typhography variant="lg">Cancel</Typhography>
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isLoggedIn}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Spinner />
              <Typhography variant="lg">Processing...</Typhography>
            </>
          ) : !isLoggedIn ? (
            <Typhography variant="lg">Connect Wallet First</Typhography>
          ) : (
            <Typhography variant="lg">Complete Registration</Typhography>
          )}
        </Button>
      </div>
    </form>
  );
});

RegistrationForm.displayName = "RegistrationForm";

export default RegistrationForm;
