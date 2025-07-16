
"use client";

import { seedDatabase } from "@/lib/data";
import { Button } from "./ui/button";
import { useState } from "react";
import { Loader2, Database } from "lucide-react";

export function SeedButton() {
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            await seedDatabase();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSeeding(false);
            window.location.reload();
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                </>
            ) : (
                <>
                    <Database className="mr-2 h-4 w-4" />
                    Seed Database
                </>
            )}
        </Button>
    )
}
