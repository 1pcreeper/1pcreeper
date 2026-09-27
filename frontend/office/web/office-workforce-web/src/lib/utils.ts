import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPostgresDate(pgDate: string | number[]): string {
    let dateStr = pgDate as string;

    // Handle array case from Spring Boot / Jackson
    if (Array.isArray(pgDate)) {
        dateStr = `${pgDate[0]}-${String(pgDate[1]).padStart(2, '0')}-${String(pgDate[2]).padStart(2, '0')}`;
    } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }

    // 1. Validate against the standard Postgres date output format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // Fallback instead of crashing if possible
        if (typeof pgDate === 'string' && !isNaN(Date.parse(pgDate))) {
            const d = new Date(pgDate);
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return String(pgDate); // instead of throwing error which breaks the UI
    }

    // 2. Extract year, month, and day components as integers
    const [year, month, day] = dateStr.split('-').map(Number);

    // 3. Instantiate JS Date using local time variables (Note: JS months are 0-indexed)
    const localDate = new Date(year, month - 1, day);

    // 4. Return your desired TypeScript string output format
    return localDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
