package ai

import (
	"fmt"
	"os"

	// "github.com/Azure/azure-sdk-for-go/sdk/ai/azopenai"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/azure"
	"github.com/openai/openai-go/option"
)

const DefaultAPIVersion = "2025-01-01-preview"

func CreateOpenAIClientWithToken(endpoint string, apiVersion string) (*openai.Client, error) {

	if apiVersion == "" {
		apiVersion = DefaultAPIVersion
	}

	tokenCredential, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create token credential: %v", err)
	}

	client := openai.NewClient(azure.WithEndpoint(endpoint, apiVersion), azure.WithTokenCredential(tokenCredential))
	return &client, nil

}

// CreateOpenAIClientWithKey creates an OpenAI client with API key authentication
func CreateOpenAIClientWithKey(endpoint string, apiKey string, apiVersion string) (*openai.Client, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("apiKey cannot be empty")
	}

	if apiVersion == "" {
		apiVersion = DefaultAPIVersion
	}

	client := openai.NewClient(
		option.WithAPIKey(apiKey),
		azure.WithEndpoint(endpoint, apiVersion),
	)

	return &client, nil
}

func GetRequiredEnvVar(name string) (string, error) {
	value := os.Getenv(name)
	if value == "" {
		return "", fmt.Errorf("required environment variable %s is not set", name)
	}
	return value, nil
}

func CheckRequiredEnvVars(names ...string) bool {
	for _, name := range names {
		if os.Getenv(name) == "" {
			fmt.Fprintf(os.Stderr, "Required environment variable '%s' is not set\n", name)
			return false
		}
	}
	return true
}
