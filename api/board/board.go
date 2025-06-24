package board


func NewBoard(name string) *Board {
    return &Board{
        Name: name,

        Squares: []Square{
            {
                Name: "A",
                Question: "What is the capital of France?",
                Answered: false,
            },
            {
                Name: "B",
                Question: "What is the capital of Germany?",
                Answered: false,
            },
            {
                Name: "C",
                Question: "What is the capital of Italy?",
                Answered: false,
            },
            {
                Name: "D",
                Question: "What is the capital of Spain?",
                Answered: false,
            },
        },
    }
}

func (b *Board) GetSquare(name string) *Square {
    for _, square := range b.Squares {
        if square.Name == name {
            return &square
        }
    }
    return nil
}

func (b *Board) AnswerSquare(name string) {
    square := b.GetSquare(name)
    if square != nil {
        square.Answered = true
    }
}
type Board struct {
    Name string
    Category string
    Squares []Square
}

type Square struct {
    Name string
    Question string
    Answered bool
}
