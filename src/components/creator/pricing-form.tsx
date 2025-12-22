"use client";

import { useFormState } from "react-dom";

import { updateCreatorPricingAction } from "@/lib/actions/creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PricingForm({ defaultPrice }: { defaultPrice: number }) {
  const [state, formAction] = useFormState(updateCreatorPricingAction, { error: "" });

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="monthlyPrice">Monthly price (USD)</Label>
        <Input
          id="monthlyPrice"
          name="monthlyPrice"
          type="number"
          min="0"
          step="1"
          defaultValue={defaultPrice}
          required
        />
        <p className="text-xs text-muted-foreground">Enter 0 for a free tier.</p>
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit">Save price</Button>
    </form>
  );
}
