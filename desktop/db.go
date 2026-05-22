package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"strconv"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDB() {
	exePath, _ := os.Executable()
	dbDir := filepath.Dir(exePath)
	os.MkdirAll(filepath.Join(dbDir, "logs"), 0755)

	var err error
	db, err = sql.Open("sqlite", filepath.Join(dbDir, "dudu_pos.db"))
	if err != nil {
		log.Fatal(err)
	}
	db.SetMaxOpenConns(1)

	db.Exec(`CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		spec TEXT DEFAULT '',
		unit TEXT DEFAULT '箱',
		reference_price REAL DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS orders (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		order_no TEXT UNIQUE NOT NULL,
		order_date DATE NOT NULL,
		total_qty INTEGER DEFAULT 0,
		total_amount REAL DEFAULT 0,
		amount_cn TEXT DEFAULT '',
		remark TEXT DEFAULT '',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS order_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
		row_num INTEGER NOT NULL,
		product_name TEXT NOT NULL,
		spec TEXT DEFAULT '',
		unit TEXT DEFAULT '箱',
		qty INTEGER NOT NULL DEFAULT 1,
		price REAL NOT NULL DEFAULT 0,
		amount REAL NOT NULL DEFAULT 0,
		remark TEXT DEFAULT ''
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS settings (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL
	)`)

	// Seed products
	var count int
	db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if count == 0 {
		seeds := []struct{ name, spec, unit string; price float64 }{
			{"富得1500圆桶", "", "箱", 63},
			{"富得1000圆桶", "", "箱", 45},
			{"富得850圆桶", "", "箱", 38},
			{"富得650方桶", "", "箱", 54},
			{"富得500方桶", "", "箱", 42},
			{"纸碗500ml", "500ml", "箱", 55},
			{"纸碗750ml", "750ml", "箱", 68},
			{"纸碗1000ml", "1000ml", "箱", 80},
			{"纸盒小号", "小号", "箱", 35},
			{"纸盒中号", "中号", "箱", 48},
			{"纸盒大号", "大号", "箱", 60},
			{"塑料杯200ml", "200ml", "件", 28},
			{"竹筷", "", "件", 12},
			{"塑料袋小", "小号", "件", 8},
			{"塑料袋大", "大号", "件", 15},
		}
		for _, s := range seeds {
			db.Exec("INSERT INTO products(name,spec,unit,reference_price) VALUES(?,?,?,?)", s.name, s.spec, s.unit, s.price)
		}
		log.Printf("Seeded %d products", len(seeds))
	}
}

// WindowGeometry stores the last window position and size.
type WindowGeometry struct {
	X, Y, Width, Height int
}

func loadWindowGeometry() WindowGeometry {
	geo := WindowGeometry{Width: 1200, Height: 800}
	rows, err := db.Query("SELECT key, value FROM settings WHERE key IN ('win_x','win_y','win_w','win_h')")
	if err != nil {
		return geo
	}
	defer rows.Close()
	for rows.Next() {
		var k, v string
		rows.Scan(&k, &v)
		switch k {
		case "win_x":
			geo.X, _ = strconv.Atoi(v)
		case "win_y":
			geo.Y, _ = strconv.Atoi(v)
		case "win_w":
			geo.Width, _ = strconv.Atoi(v)
		case "win_h":
			geo.Height, _ = strconv.Atoi(v)
		}
	}
	return geo
}

func saveWindowGeometry(x, y, w, h int) {
	if w <= 0 || h <= 0 {
		return
	}
	db.Exec("INSERT OR REPLACE INTO settings(key,value) VALUES('win_x',?)", strconv.Itoa(x))
	db.Exec("INSERT OR REPLACE INTO settings(key,value) VALUES('win_y',?)", strconv.Itoa(y))
	db.Exec("INSERT OR REPLACE INTO settings(key,value) VALUES('win_w',?)", strconv.Itoa(w))
	db.Exec("INSERT OR REPLACE INTO settings(key,value) VALUES('win_h',?)", strconv.Itoa(h))
}