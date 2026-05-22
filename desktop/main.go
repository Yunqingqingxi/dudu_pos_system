package main

import (
	"context"
	"embed"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	webview "github.com/jchv/go-webview2"
)

//go:embed frontend/dist/*
var distFS embed.FS

func main() {
	// Set up logging to logs/ folder next to the executable
	exePath, err := os.Executable()
	if err != nil {
		exePath, _ = os.Getwd()
	}
	baseDir := filepath.Dir(exePath)

	logDir := filepath.Join(baseDir, "logs")
	os.MkdirAll(logDir, 0755)

	logFile, err := os.OpenFile(filepath.Join(logDir, "server.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err == nil {
		log.SetOutput(logFile)
	}
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("嘟嘟 POS 系统启动中...")

	// Change working directory to the executable's directory
	// so SQLite database is created next to the exe
	os.Chdir(baseDir)

	// Initialize database
	initDB()
	defer db.Close()

	// Set up HTTP server
	handler := setupRouter(distFS)
	server := &http.Server{
		Addr:         ":8000",
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown on Ctrl+C
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Println("HTTP server starting on :8000")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Wait for server to be ready
	for i := 0; i < 30; i++ {
		time.Sleep(500 * time.Millisecond)
		resp, err := http.Get("http://localhost:8000/api/health")
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == 200 {
				log.Println("Server ready, opening window")
				break
			}
		}
	}

	// Open WebView2 desktop window
	w := webview.New(false)
	defer w.Destroy()
	w.SetTitle("嘟嘟 POS 系统")
	w.SetSize(1280, 820, webview.HintFixed)
	w.Navigate("http://localhost:8000")
	w.Run()

	// Shutdown server when window closes
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	server.Shutdown(ctx)
	log.Println("嘟嘟 POS 系统已停止")
}