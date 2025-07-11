package ai

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/openai/openai-go"
)

// Define the structured output schema

var schema = map[string]interface{}{

	"type": "object",
	"properties": map[string]interface{}{
		"name": map[string]interface{}{
			"type": "string",
		},
		"description": map[string]interface{}{
			"type": "string",
		},
		"category": map[string]interface{}{
			"type": "string",
		},
		"squares": map[string]interface{}{
			"type": "array",
			"items": map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"name": map[string]interface{}{
						"type": "string",
					},
					"question": map[string]interface{}{
						"type": "string",
					},
					"answered": map[string]interface{}{
						"type": "boolean",
					},
				},
			},
		},
	},
}
var messages = []openai.ChatCompletionMessageParamUnion{
	// You set the tone and rules of the conversation with a prompt as the system role.
	{
		OfSystem: &openai.ChatCompletionSystemMessageParam{
			Content: openai.ChatCompletionSystemMessageParamContentUnion{
				OfString: openai.String(`You are a bingo creator. You will make bingo cards about me an my coworkers.

                You will respond with a list of bingo cards in JSON format.

                Here is the structs of a bingo board:

                type Board struct {
                    Name string json:"name"
                    Description string json:"description"
                    Category string json:"category"
                    Squares []Square json:"squares"
                }

                type Square struct {
                    Name string json:"name"
                    Question string json:"question"
                    Answered bool json:"answered"
                }

                The bingo board will be a 5x5 grid of squares. When you respond the answerd squares will be marked as false.

                Answer should only be the JSON, and only of one bingo board, with 25 questions! do not surround it with ` + "```json   ``` ",
                ),
			},
		},
	},
	// The user asks a question
	{
		OfUser: &openai.ChatCompletionUserMessageParam{
			Content: openai.ChatCompletionUserMessageParamContentUnion{
				OfString: openai.String(`Can you write me a bingo board?
                The coworkers are:
                - Victor, a .NET developer with a passion for music.
                - Ermin, a true runner and bosnian. Javascript developer.
                - Leffe, a front-end developer with love for japanese culture.
                - Ebba, a front-end developer who loves food.


                `),
			},
		},
	},
}

func ChatCompletion() (string, error) {
	client, err := CreateOpenAIClientWithToken("https://openaiv27t3uzcmxm4y.openai.azure.com", os.Getenv("OPENAI_API_VERSION"))
	if err != nil {
		return "", err
	}

	// azopenai.

	resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{

		Model:    openai.ChatModel("preview"),
		Messages: messages,
		//       Tools: []openai.ChatCompletionToolParam{
		// {
		// 	Type: "function",
		// 	Function: openai.FunctionDefinitionParam{
		// 		Name:       "query",
		// 		Parameters: schema,
		// 	},
		// },
		// },
	})

	if err != nil {
		log.Printf("ERROR: %s", err)
		return "", err
	}

	gotReply := false

	for _, choice := range resp.Choices {
		gotReply = true

		if choice.Message.Content != "" {
			fmt.Fprintf(os.Stdout, "Content[%d]: %s\n", choice.Index, choice.Message.Content)
		}

		if choice.FinishReason != "" {
			fmt.Fprintf(os.Stderr, "Finish reason[%d]: %s\n", choice.Index, choice.FinishReason)
		}
	}

	if gotReply {
		fmt.Fprintf(os.Stdout, "Got chat completions reply\n")
	}

	return resp.Choices[0].Message.Content, nil

}
