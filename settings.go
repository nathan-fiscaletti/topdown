package main

import (
	"encoding/json"
	"io"
	"os"
)

const (
	SettingsFile = "topdown-settings.json"
)

var (
	defaultSettings = Settings{
		OpenAPIKey: "",
	}
)

type Settings struct {
	OpenAPIKey string `json:"open_api_key"`
}

func NewSettings() *Settings {
	return &Settings{}
}

func LoadSettings() (*Settings, error) {
	f, err := os.Open(SettingsFile)
	if err != nil {
		if os.IsNotExist(err) {
			s := defaultSettings
			return &s, nil
		}
		return nil, err
	}
	jsonBytes, err := io.ReadAll(f)
	if err != nil {
		return nil, err
	}
	var settings Settings
	err = json.Unmarshal(jsonBytes, &settings)
	if err != nil {
		return nil, err
	}
	return &settings, nil
}

func (s *Settings) UpdateAndSave(values map[string]any) error {
	jsonBytes, err := json.Marshal(values)
	if err != nil {
		return err
	}
	err = json.Unmarshal(jsonBytes, s)
	if err != nil {
		return err
	}
	return s.Save()
}

func (s *Settings) Map() (map[string]any, error) {
	var output map[string]any

	jsonBytes, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(jsonBytes, &output)
	if err != nil {
		return nil, err
	}

	return output, nil
}

func (s *Settings) Save() error {
	jsonBytes, err := json.Marshal(s)
	if err != nil {
		return err
	}
	f, err := os.Create(SettingsFile)
	if err != nil {
		return err
	}
	_, err = f.Write(jsonBytes)
	if err != nil {
		return err
	}
	return nil
}
