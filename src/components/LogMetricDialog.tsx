import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddHealthMetric } from "@/hooks/useHealthMetrics";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

export type QuickActionType = "activity" | "water" | "heart" | "stress" | null;

interface LogMetricDialogProps {
  quickAction?: QuickActionType;
  onQuickActionComplete?: () => void;
}

export function LogMetricDialog({ quickAction, onQuickActionComplete }: LogMetricDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    heart_rate: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    temperature: "",
    stress_level: "",
    hydration: "",
    energy_level: "",
    steps: "",
    sleep_hours: "",
  });

  const addMetric = useAddHealthMetric();
  const { toast } = useToast();

  // Open dialog when quickAction is set
  useEffect(() => {
    if (quickAction) {
      setOpen(true);
    }
  }, [quickAction]);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onQuickActionComplete) {
      onQuickActionComplete();
    }
  };

  const getDialogTitle = () => {
    switch (quickAction) {
      case "activity": return "Log Activity";
      case "water": return "Log Hydration";
      case "heart": return "Check Heart Rate";
      case "stress": return "Log Stress Level";
      default: return "Log Health Metrics";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addMetric.mutateAsync({
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        blood_pressure_systolic: formData.blood_pressure_systolic
          ? parseInt(formData.blood_pressure_systolic)
          : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic
          ? parseInt(formData.blood_pressure_diastolic)
          : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        stress_level: formData.stress_level ? parseInt(formData.stress_level) : null,
        hydration: formData.hydration ? parseInt(formData.hydration) : null,
        energy_level: formData.energy_level ? parseInt(formData.energy_level) : null,
        steps: formData.steps ? parseInt(formData.steps) : null,
        sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : null,
        sleep_quality: null,
        recorded_at: new Date().toISOString(),
      });

      toast({
        title: "Metrics logged",
        description: "Your health data has been saved successfully.",
      });

      handleClose(false);
      setFormData({
        heart_rate: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        temperature: "",
        stress_level: "",
        hydration: "",
        energy_level: "",
        steps: "",
        sleep_hours: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save health metrics",
        variant: "destructive",
      });
    }
  };

  const renderQuickActionFields = () => {
    switch (quickAction) {
      case "activity":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Steps</label>
              <Input
                type="number"
                placeholder="8000"
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                className="bg-muted/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Energy Level (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={formData.energy_level}
                onChange={(e) => setFormData({ ...formData, energy_level: e.target.value })}
                className="bg-muted/50"
              />
            </div>
          </div>
        );
      case "water":
        return (
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Hydration Level (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="68"
              value={formData.hydration}
              onChange={(e) => setFormData({ ...formData, hydration: e.target.value })}
              className="bg-muted/50"
              autoFocus
            />
          </div>
        );
      case "heart":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Heart Rate (BPM)</label>
              <Input
                type="number"
                placeholder="72"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                className="bg-muted/50"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">BP Systolic</label>
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">BP Diastolic</label>
                <Input
                  type="number"
                  placeholder="80"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>
        );
      case "stress":
        return (
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Stress Level (0-100)</label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="42"
              value={formData.stress_level}
              onChange={(e) => setFormData({ ...formData, stress_level: e.target.value })}
              className="bg-muted/50"
              autoFocus
            />
          </div>
        );
      default:
        return renderAllFields();
    }
  };

  const renderAllFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Heart Rate (BPM)</label>
          <Input
            type="number"
            placeholder="72"
            value={formData.heart_rate}
            onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
            className="bg-muted/50"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Temperature (°F)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="98.6"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            className="bg-muted/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">BP Systolic</label>
          <Input
            type="number"
            placeholder="120"
            value={formData.blood_pressure_systolic}
            onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
            className="bg-muted/50"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">BP Diastolic</label>
          <Input
            type="number"
            placeholder="80"
            value={formData.blood_pressure_diastolic}
            onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
            className="bg-muted/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Stress Level (0-100)</label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="42"
            value={formData.stress_level}
            onChange={(e) => setFormData({ ...formData, stress_level: e.target.value })}
            className="bg-muted/50"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Hydration (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="68"
            value={formData.hydration}
            onChange={(e) => setFormData({ ...formData, hydration: e.target.value })}
            className="bg-muted/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Energy (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="85"
            value={formData.energy_level}
            onChange={(e) => setFormData({ ...formData, energy_level: e.target.value })}
            className="bg-muted/50"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Steps</label>
          <Input
            type="number"
            placeholder="8000"
            value={formData.steps}
            onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
            className="bg-muted/50"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Sleep Hours</label>
        <Input
          type="number"
          step="0.5"
          placeholder="7.5"
          value={formData.sleep_hours}
          onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
          className="bg-muted/50"
        />
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {!quickAction && (
        <DialogTrigger asChild>
          <Button variant="gradient" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Log Metrics
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="glass-card-elevated border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {renderQuickActionFields()}
          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={addMetric.isPending}
          >
            {addMetric.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
