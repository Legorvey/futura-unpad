"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeam, joinTeam } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface MechaturaRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MechaturaRegistrationModal({ isOpen, onOpenChange }: MechaturaRegistrationModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<string | null>(null);
  const [action, setAction] = useState<"create" | "join" | null>(null);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setStep(2);
  };

  const handleActionSelect = (selectedAction: "create" | "join") => {
    setAction(selectedAction);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (action === "create") {
        if (!category) throw new Error("Category missing");
        await createTeam(category, teamName);
        toast.success("Team created successfully!");
      } else {
        await joinTeam(joinCode);
        toast.success("Joined team successfully!");
      }
      onOpenChange(false);
      router.push("/profile/mechatura");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Choose Competition Category"}
            {step === 2 && "Team Setup"}
            {step === 3 && (action === "create" ? "Create Your Team" : "Join a Team")}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Select the category you wish to participate in."}
            {step === 2 && "Will you be creating a new team or joining an existing one?"}
            {step === 3 && (action === "create" ? "Enter a name for your new team." : "Enter the join code provided by your team leader.")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 text-lg flex flex-col gap-2"
                onClick={() => handleCategorySelect("robot_sumo")}
              >
                <span>🤖</span>
                Robot Sumo
              </Button>
              <Button
                variant="outline"
                className="h-32 text-lg flex flex-col gap-2"
                onClick={() => handleCategorySelect("robot_transporter")}
              >
                <span>🏎️</span>
                Robot Transporter
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 text-lg"
                onClick={() => handleActionSelect("create")}
              >
                Create a Team
              </Button>
              <Button
                variant="outline"
                className="h-32 text-lg"
                onClick={() => handleActionSelect("join")}
              >
                Join a Team
              </Button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {action === "create" ? (
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Join Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="Enter 6-character code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
