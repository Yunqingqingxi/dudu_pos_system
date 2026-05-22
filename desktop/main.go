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
	"golang.org/x/sys/windows"
)

//go:embed frontend/dist/*
var distFS embed.FS

func init() {
	// Declare DPI awareness before any window is created,
	// otherwise WebView2 renders at 96 DPI and gets blurry on high-DPI displays
	user32 := windows.NewLazySystemDLL("user32.dll")
	setDPIAware := user32.NewProc("SetProcessDPIAware")
	setDPIAware.Call()
}

func main() {
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

	os.Chdir(baseDir)

	initDB()
	defer db.Close()

	handler := setupRouter(distFS)
	server := &http.Server{
		Addr:         ":8000",
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Println("HTTP server starting on :8000")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

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

	// HintNone allows the window to be freely resized and properly
	// handles DPI scaling on high-DPI monitors (HintFixed can cause
	// blur when combined with display scaling)
	w := webview.New(false)
	defer w.Destroy()
	w.SetTitle("嘟嘟 POS 系统")
	w.SetSize(1280, 820, webview.HintNone)
	w.Navigate("http://localhost:8000")
	w.Run()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	server.Shutdown(ctx)
	log.Println("嘟嘟 POS 系统已停止")
}