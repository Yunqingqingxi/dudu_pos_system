package main

import (
	"embed"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

//go:embed embed/*
var backendFS embed.FS

func main() {
	// Extract backend to temp dir
	tempDir, _ := os.MkdirTemp("", "dudu_pos")
	defer os.RemoveAll(tempDir)

	backendData, _ := backendFS.ReadFile("embed/dudu_pos.exe")
	backendPath := filepath.Join(tempDir, "dudu_pos.exe")
	os.WriteFile(backendPath, backendData, 0755)

	// Start backend
	cmd := exec.Command(backendPath)
	cmd.Stdout = nil
	cmd.Stderr = nil
	if err := cmd.Start(); err != nil {
		fmt.Println("Failed to start:", err)
		fmt.Scanln()
		return
	}
	defer cmd.Process.Kill()

	// Wait for backend to be ready
	for i := 0; i < 30; i++ {
		time.Sleep(500 * time.Millisecond)
		resp, err := http.Get("http://localhost:8000/api/health")
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == 200 {
				break
			}
		}
	}

	// Open in Chrome/Edge app mode
	chromeCandidates := []string{
		"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
		"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
		filepath.Join(os.Getenv("LOCALAPPDATA"), "Google", "Chrome", "Application", "chrome.exe"),
		"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
		"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
		filepath.Join(os.Getenv("PROGRAMFILES(X86)"), "Microsoft\\Edge\\Application\\msedge.exe"),
	}

	for _, cp := range chromeCandidates {
		if _, err := os.Stat(cp); err == nil {
			exec.Command(cp,
				"--app=http://localhost:8000",
				"--window-size=1280,820",
			).Start()
			break
		}
	}

	cmd.Wait()
}