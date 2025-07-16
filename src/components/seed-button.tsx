
"use client";

import { useState } from "react";
import { Loader2, Database } from "lucide-react";
import { Button } from "./ui/button";
import { seedDatabaseAction } from "@/app/actions";

export function SeedButton() {
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            await seedDatabaseAction();
            // We don't need to manually reload anymore, revalidatePath handles it.
        } catch (e) {
            console.error(e);
        } finally {
            setIsSeeding(false);
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                </>
            ) : (
                <>
                    <Database className="mr-2 h-4 w-4" />
                    Reset Data
                </>
            )}
        </Button>
    )
}
