import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const typhographyVariants = cva("dark block", {
  variants: {
    variant: {
      lg: "text-sm sm:text-lg",
      "2xl": "text-base sm:text-2xl",
      "3xl": "text-lg sm:text-3xl",

      t1: "text-xs sm:text-base",
      t2: "text-[10px] sm:text-sm",
      t3: "text-[5px] sm:text-xs",
    },
  },
  defaultVariants: {
    variant: "t1",
  },
});

type TyphographyVariant = VariantProps<typeof typhographyVariants> &
  React.ComponentPropsWithoutRef<"span">;

export const Typhography = forwardRef<HTMLSpanElement, TyphographyVariant>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(typhographyVariants({ variant }), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Typhography.displayName = "Typhography";
