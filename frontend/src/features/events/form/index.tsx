import { useState, type FC, type FormEvent } from "react";
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

const EventsFormPage: FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: id,
    name: "",
    email: "",
    phoneNo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSubmitting(true);

    toast.promise(
      () =>
        new Promise((res) => {
          setTimeout(() => {
            res({});
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormData({
              id: id,
              name: "",
              email: "",
              phoneNo: "",
            });
          }, 1200);
        }),
      {
        loading: "Loading...",
        success: () => `Event has been registered`,
        error: "Error",
      }
    );
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
              className={`${isSubmitting ? "cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <Typhography variant="lg">Sending...</Typhography>
                </>
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
