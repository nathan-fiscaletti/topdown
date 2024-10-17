package main

import (
	"embed"
	"errors"
	"io"
	"os"
	"time"

	"github.com/sqweek/dialog"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func reportError(reason string, err error) {
	println("Error: %v", err)
	dialog.Message("%v: %v", reason, err.Error()).
		Title("Error").
		Error()
}

func main() {
	// Create an instance of the app structure
	app, err := NewApp()
	if err != nil {
		reportError("Failed to create app", err)
		return
	}

	appMenu := menu.NewMenu()

	fileMenu := appMenu.AddSubmenu("File")

	fileMenu.AddText("&New", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		reportError("Not implemented", errors.New("not implemented"))
		// runtime.EventsEmit(app.ctx, "new-file", nil)
	})

	fileMenu.AddText("&Save", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
		responseChan := make(chan string)

		runtime.EventsOnce(app.ctx, "markdown-content", func(data ...any) {
			responseChan <- data[0].(string)
		})
		runtime.EventsEmit(app.ctx, "request-content")

		go func() {
			select {
			case content := <-responseChan:
				saveFileDialog := dialog.File()
				saveFileDialog.Filter("Markdown files", "md")
				saveFileDialog.Title("Save Markdown File")
				path, err := saveFileDialog.Save()
				if err != nil {
					if !errors.Is(err, dialog.ErrCancelled) {
						reportError("Failed to save file", err)
					}
					return
				}
				// write the content to the file
				f, err := os.Create(path)
				if err != nil {
					reportError("Failed to create file", err)
					return
				}
				defer f.Close()
				_, err = f.WriteString(content)
				if err != nil {
					reportError("Failed to write file", err)
					return
				}
			case <-time.After(5 * time.Second):
				reportError("Timed out", errors.New("timed out while waiting for content"))
			}
		}()
	})
	fileMenu.AddText("&Open", keys.CmdOrCtrl("o"), func(_ *menu.CallbackData) {
		openFileDialog := dialog.File()
		openFileDialog.Filter("Markdown files", "md")
		openFileDialog.Title("Open Markdown File")
		path, err := openFileDialog.Load()
		if err != nil {
			if !errors.Is(err, dialog.ErrCancelled) {
				reportError("Failed to load file path", err)
			}
			return
		}
		// load the file content
		f, err := os.Open(path)
		if err != nil {
			reportError("Failed to open file", err)
			return
		}
		defer f.Close()
		data, err := io.ReadAll(f)
		if err != nil {
			reportError("Failed to read file", err)
			return
		}
		// convert the data to a string
		content := string(data)

		runtime.EventsEmit(app.ctx, "open-file", content)
	})
	fileMenu.AddText("&Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(app.ctx)
	})

	editMenu := appMenu.AddSubmenu("Edit")
	editMenu.AddText("Clear All", keys.CmdOrCtrl("k"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "clear-all", nil)
	})
	editMenu.AddText("Settings", nil, func(_ *menu.CallbackData) {
		encodedSettings, err := app.settings.Map()
		if err != nil {
			reportError("Failed to encode settings", err)
		}
		runtime.EventsEmit(app.ctx, "open-settings", encodedSettings)
	})

	insertMenu := appMenu.AddSubmenu("Insert")
	insertMenu.AddText("Section", keys.CmdOrCtrl("i"), func(_ *menu.CallbackData) {
		runtime.EventsEmit(app.ctx, "insert-section", nil)
	})

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "Topdown",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup:        app.startup,
		Menu:             appMenu,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		reportError("Failed to run application", err)
	}
}
