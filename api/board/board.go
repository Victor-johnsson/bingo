package board

import (
	"bingo/ai"
	"encoding/json"
)

func (b *Board) GetSquare(name string) *Square {
	for _, square := range b.Squares {
		if square.Name == name {
			return &square
		}
	}
	return nil
}

var boards = map[string]*Board{}

func GetBoard(name string) (*Board, error) {

	// Get the board from the map
	theBoard := boards[name]
	if theBoard != nil {
		return theBoard, nil
	}

	newBoard := &Board{}
	resp, err := ai.AiGeneratedBoard()
	if err != nil {
		return nil, err
	}

	// Unmarshal the AI response into our new instance
	marshErr := json.Unmarshal([]byte(resp), newBoard)

	if marshErr != nil {
		return nil, err
	}

	boards[name] = newBoard
	return newBoard, nil

}

func UpdateBoard(name string, square Square) (*Board, error) {

	// Get the board from the map
	theBoard := boards[name]
	if theBoard == nil {
        return nil, nil
	}

    for i, s := range theBoard.Squares {
        if s.Name != square.Name {
            continue
        }
        theBoard.Squares[i] = square
        break;
    }
	return theBoard, nil

}

func (b *Board) AnswerSquare(name string) {
	square := b.GetSquare(name)
	if square != nil {
		square.Answered = true
	}
}

type Board struct {
	Name     string
	Category string
	Squares  []Square
}

type Square struct {
	Name     string
	Question string
	Answered bool
}
