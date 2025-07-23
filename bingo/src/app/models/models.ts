export interface Board {

    Name: string;
    Category: string;
    Squares: Question[];

}
export interface Question {
    Name: string;
    Question: string;
    Answered: boolean;
}
