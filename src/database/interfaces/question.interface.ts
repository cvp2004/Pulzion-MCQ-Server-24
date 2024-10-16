export interface QuestionType {
    id: number;
    statement: string;
    options: string[];
    code: string | null;
    imageUrl: string | null;
}
