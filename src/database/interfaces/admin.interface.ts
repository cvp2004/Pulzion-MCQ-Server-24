
export type Question = {
    id : string,
    statement: string;
    options: string[];
    code?: string | null;
    image_url?: string | null;
    correct_option: number;
    fk_event: Event | null;
    created_at: Date;
    updated_at: Date;
};