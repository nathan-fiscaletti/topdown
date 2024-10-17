package main

import (
	"context"
	"errors"
	"strings"

	"github.com/sashabaranov/go-openai"
)

// App struct
type App struct {
	ctx context.Context

	settings *Settings
}

// NewApp creates a new App application struct
func NewApp() (*App, error) {
	settings, err := LoadSettings()
	if err != nil {
		return nil, err
	}

	return &App{
		settings: settings,
	}, nil
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Regenerate(currentMarkdown string) string {
	client := openai.NewClient(a.settings.OpenAPIKey)

	message := openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleUser,
		Content: "Re-word the following markdown. Respond only with the re-worded markdown.\n\n" + currentMarkdown,
	}

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4o,
			Messages: []openai.ChatCompletionMessage{
				message,
			},
		},
	)
	if err != nil {
		if strings.Contains(err.Error(), "Unauthorized") {
			reportError("Failed to regenerate", errors.New("In order to use the AI features of this application, you must provide an OpenAI API key in the settings under Edit -> Settings. You can get an API key from https://platform.openai.com/account/api-keys"))
		} else {
			reportError("Failed to regenerate", err)
		}
		return ""
	}

	return resp.Choices[0].Message.Content
}

func (a *App) UpdateSettings(data map[string]any) {
	err := a.settings.UpdateAndSave(data)
	if err != nil {
		reportError("Failed to update settings", err)
	}
}
