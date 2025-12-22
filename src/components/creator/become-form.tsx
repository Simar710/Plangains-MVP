"use client";

import { useFormState } from "react-dom";

import { becomeCreatorAction } from "@/lib/actions/creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BecomeCreatorForm({ defaultSlug }: { defaultSlug?: string }) {
  const [state, formAction] = useFormState(becomeCreatorAction, { error: "" });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" name="displayName" required placeholder="Coach Jamie" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Public slug</Label>
        <Input
          id="slug"
          name="slug"
          required
          defaultValue={defaultSlug}
          placeholder="coach-jamie"
        />
        <p className="text-xs text-muted-foreground">Used for your public page URL.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" placeholder="Short intro for members" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="monthlyPrice">Monthly price (USD)</Label>
        <Input id="monthlyPrice" name="monthlyPrice" type="number" min="0" step="1" required />
        <p className="text-xs text-muted-foreground">Set 0 for a free subscription.</p>
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="w-full">
        Become a creator
      </Button>
    </form>
  );
}
