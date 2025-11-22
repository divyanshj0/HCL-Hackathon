import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface GoalInputFormProps {
    type: 'water' | 'calories' | 'sleep';
    currentValue: number;
    currentGoal: number;
    unit: string;
    label: string;
    onUpdate: () => void;
}

const GoalInputForm = ({ type, currentValue, currentGoal, unit, label, onUpdate }: GoalInputFormProps) => {
    const [newData, setNewData] = useState(currentValue.toString());
    const [newGoal, setNewGoal] = useState(currentGoal.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const userToken = localStorage.getItem('userToken');
    const endpoint = 'http://localhost:5000/api/goals';

    const handleLogData = async () => {
        if (!userToken) {
            toast.error("You must be logged in.");
            return;
        }
        
        const value = parseFloat(newData);
        if (isNaN(value) || value < 0) {
            toast.error(`Please enter a valid ${label} value.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${endpoint}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ type, value }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success(result.message || `${label} data logged successfully!`);
                onUpdate();
                setIsDialogOpen(false); // Close dialog on success
            } else {
                toast.error(result.message || `Failed to log ${label}.`);
            }
        } catch (error) {
            toast.error("Network error logging data.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleSetGoal = async () => {
        if (!userToken) {
            toast.error("You must be logged in.");
            return;
        }

        const target = parseFloat(newGoal);
        if (isNaN(target) || target <= 0) {
            toast.error(`Please enter a valid ${label} goal (must be greater than 0).`);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${endpoint}/set-target`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ type, target }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success(result.message || `${label} goal set to ${target}.`);
                onUpdate();
                setIsDialogOpen(false); // Close dialog on success
            } else {
                toast.error(result.message || `Failed to set ${label} goal.`);
            }
        } catch (error) {
            toast.error("Network error setting goal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset local form data when dialog opens
    useEffect(() => {
        if (isDialogOpen) {
            setNewData(currentValue.toString());
            setNewGoal(currentGoal.toString());
        }
    }, [isDialogOpen, currentValue, currentGoal]);


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    Log {label} / Set Goal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Today's {label} & Set Goal</DialogTitle>
                    <DialogDescription>
                        Enter your current {label.toLowerCase()} reading and update your daily target.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Log Daily Data */}
                    <div className="space-y-2">
                        <Label htmlFor="data">Today's {label} ({unit})</Label>
                        <Input
                            id="data"
                            type="number"
                            value={newData}
                            onChange={(e) => setNewData(e.target.value)}
                            placeholder={currentValue.toString()}
                        />
                        <Button onClick={handleLogData} disabled={isSubmitting} className="w-full" variant="default">
                            {isSubmitting ? "Logging..." : "Log Data"}
                        </Button>
                    </div>

                    {/* Set Goal */}
                    <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="goal">Daily Goal ({unit})</Label>
                        <Input
                            id="goal"
                            type="number"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            placeholder={currentGoal.toString()}
                        />
                        <Button variant="secondary" onClick={handleSetGoal} disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Saving Goal..." : "Set/Update Goal"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GoalInputForm;