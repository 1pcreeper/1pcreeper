import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPostgresDate(pgDate: string): string {
    // 1. Validate against the standard Postgres date output format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pgDate)) {
        throw new Error(`Invalid Postgres date format: ${pgDate}`);
    }

    // 2. Extract year, month, and day components as integers
    const [year, month, day] = pgDate.split('-').map(Number);

    // 3. Instantiate JS Date using local time variables (Note: JS months are 0-indexed)
    const localDate = new Date(year, month - 1, day);

    // 4. Return your desired TypeScript string output format
    return localDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}