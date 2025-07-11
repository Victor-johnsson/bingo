package board



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
