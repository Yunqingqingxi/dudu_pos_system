package main

import (
	"bytes"
	"database/sql"
	"embed"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

// ---- Types ----

type Product struct {
	ID             int     `json:"id"`
	Name           string  `json:"name"`
	Spec           string  `json:"spec"`
	Unit           string  `json:"unit"`
	ReferencePrice float64 `json:"reference_price"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

type OrderItem struct {
	ID          int     `json:"id"`
	OrderID     int     `json:"order_id"`
	RowNum      int     `json:"row_num"`
	ProductName string  `json:"product_name"`
	Spec        string  `json:"spec"`
	Unit        string  `json:"unit"`
	Qty         int     `json:"qty"`
	Price       float64 `json:"price"`
	Amount      float64 `json:"amount"`
	Remark      string  `json:"remark"`
}

type Order struct {
	ID          int         `json:"id"`
	OrderNo     string      `json:"order_no"`
	OrderDate   string      `json:"order_date"`
	TotalQty    int         `json:"total_qty"`
	TotalAmount float64     `json:"total_amount"`
	AmountCN    string      `json:"amount_cn"`
	Remark      string      `json:"remark"`
	CreatedAt   string      `json:"created_at"`
	Items       []OrderItem `json:"items"`
}

type ListResponse struct {
	Items interface{} `json:"items"`
	Total int         `json:"total"`
}

type DashboardData struct {
	TodayOrders  int     `json:"today_orders"`
	TodayAmount  float64 `json:"today_amount"`
	MonthOrders  int     `json:"month_orders"`
	MonthAmount  float64 `json:"month_amount"`
	RecentOrders []Order `json:"recent_orders"`
}

type DailySale struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
	Orders int     `json:"orders"`
}

type TopProduct struct {
	Name       string  `json:"name"`
	TotalQty   int     `json:"total_qty"`
	TotalAmount float64 `json:"total_amount"`
}

type ChartData struct {
	DailySales  []DailySale  `json:"daily_sales"`
	TopProducts []TopProduct `json:"top_products"`
}

// ---- Router ----

func setupRouter(dist embed.FS) http.Handler {
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/health", handleHealth)
	mux.HandleFunc("/api/products", handleProducts)
	mux.HandleFunc("/api/products/", handleProductByID)
	mux.HandleFunc("/api/orders", handleOrders)
	mux.HandleFunc("/api/orders/", handleOrderByID)
	mux.HandleFunc("/api/dashboard", handleDashboard)
	mux.HandleFunc("/api/dashboard/charts", handleCharts)
	mux.HandleFunc("/api/export/products", handleExportProducts)
	mux.HandleFunc("/api/export/orders", handleExportOrders)
	mux.HandleFunc("/api/export/database", handleExportDatabase)
	mux.HandleFunc("/api/import/products", handleImportProducts)
	mux.HandleFunc("/api/import/orders", handleImportOrders)

	// SPA: serve embedded frontend
	frontendFS, err := fs.Sub(dist, "frontend/dist")
	if err != nil {
		panic("frontend/dist not found in embedded filesystem: " + err.Error())
	}
	fileServer := http.FileServer(http.FS(frontendFS))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// API routes handled by patterns above, skip
		if strings.HasPrefix(r.URL.Path, "/api") {
			http.NotFound(w, r)
			return
		}

		// Try serving the file directly
		path := strings.TrimPrefix(r.URL.Path, "/")
		f, fErr := frontendFS.Open(path)
		if fErr == nil {
			f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}

		// SPA fallback: serve index.html for client-side routing
		indexFile, idxErr := frontendFS.Open("index.html")
		if idxErr != nil {
			http.NotFound(w, r)
			return
		}
		defer indexFile.Close()
		data, _ := io.ReadAll(indexFile)
		http.ServeContent(w, r, "index.html", time.Now(), bytes.NewReader(data))
	})
	return corsMiddleware(mux)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == "OPTIONS" {
			w.WriteHeader(200)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"detail": msg})
}

// ---- Handlers ----

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]string{"status": "ok"})
}

// ---- Products ----

func handleProducts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		search := r.URL.Query().Get("search")
		skip, _ := strconv.Atoi(r.URL.Query().Get("skip"))
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		if limit <= 0 {
			limit = 8
		}

		var total int
		var rows *sql.Rows
		var err error

		if search != "" {
			db.QueryRow("SELECT COUNT(*) FROM products WHERE name LIKE ?", "%"+search+"%").Scan(&total)
			rows, err = db.Query("SELECT * FROM products WHERE name LIKE ? ORDER BY id ASC LIMIT ? OFFSET ?", "%"+search+"%", limit, skip)
		} else {
			db.QueryRow("SELECT COUNT(*) FROM products").Scan(&total)
			rows, err = db.Query("SELECT * FROM products ORDER BY id ASC LIMIT ? OFFSET ?", limit, skip)
		}
		if err != nil {
			writeError(w, 500, err.Error())
			return
		}
		defer rows.Close()

		products := []Product{}
		for rows.Next() {
			var p Product
			rows.Scan(&p.ID, &p.Name, &p.Spec, &p.Unit, &p.ReferencePrice, &p.CreatedAt, &p.UpdatedAt)
			products = append(products, p)
		}
		writeJSON(w, ListResponse{Items: products, Total: total})

	case "POST":
		var p Product
		json.NewDecoder(r.Body).Decode(&p)
		result, err := db.Exec("INSERT INTO products(name,spec,unit,reference_price) VALUES(?,?,?,?)", p.Name, p.Spec, p.Unit, p.ReferencePrice)
		if err != nil {
			writeError(w, 500, err.Error())
			return
		}
		id, _ := result.LastInsertId()
		db.QueryRow("SELECT * FROM products WHERE id=?", id).Scan(&p.ID, &p.Name, &p.Spec, &p.Unit, &p.ReferencePrice, &p.CreatedAt, &p.UpdatedAt)
		w.WriteHeader(201)
		writeJSON(w, p)
	}
}

func handleProductByID(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/products/"), "/")
	id, _ := strconv.Atoi(parts[0])

	switch r.Method {
	case "PUT":
		var p Product
		json.NewDecoder(r.Body).Decode(&p)
		_, err := db.Exec("UPDATE products SET name=?,spec=?,unit=?,reference_price=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
			p.Name, p.Spec, p.Unit, p.ReferencePrice, id)
		if err != nil {
			writeError(w, 500, err.Error())
			return
		}
		db.QueryRow("SELECT * FROM products WHERE id=?", id).Scan(&p.ID, &p.Name, &p.Spec, &p.Unit, &p.ReferencePrice, &p.CreatedAt, &p.UpdatedAt)
		writeJSON(w, p)

	case "DELETE":
		db.Exec("DELETE FROM products WHERE id=?", id)
		writeJSON(w, map[string]string{"message": "ok"})
	}
}

// ---- Orders ----

func handleOrders(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		keyword := r.URL.Query().Get("keyword")
		start := r.URL.Query().Get("start")
		end := r.URL.Query().Get("end")
		skip, _ := strconv.Atoi(r.URL.Query().Get("skip"))
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		if limit <= 0 {
			limit = 10
		}

		where := "WHERE 1=1"
		args := []interface{}{}
		if keyword != "" {
			where += " AND order_no LIKE ?"
			args = append(args, "%"+keyword+"%")
		}
		if start != "" {
			where += " AND order_date >= ?"
			args = append(args, start)
		}
		if end != "" {
			where += " AND order_date <= ?"
			args = append(args, end)
		}

		var total int
		db.QueryRow("SELECT COUNT(*) FROM orders "+where, args...).Scan(&total)

		query := "SELECT * FROM orders " + where + " ORDER BY created_at DESC LIMIT ? OFFSET ?"
		args = append(args, limit, skip)
		rows, _ := db.Query(query, args...)
		defer rows.Close()

		orders := []Order{}
		for rows.Next() {
			var o Order
			rows.Scan(&o.ID, &o.OrderNo, &o.OrderDate, &o.TotalQty, &o.TotalAmount, &o.AmountCN, &o.Remark, &o.CreatedAt)
			orders = append(orders, o)
		}
		writeJSON(w, ListResponse{Items: orders, Total: total})

	case "POST":
		var input struct {
			OrderDate string `json:"order_date"`
			Items     []struct {
				ProductName string  `json:"product_name"`
				Spec        string  `json:"spec"`
				Unit        string  `json:"unit"`
				Qty         int     `json:"qty"`
				Price       float64 `json:"price"`
				Amount      float64 `json:"amount"`
				Remark      string  `json:"remark"`
			} `json:"items"`
			Remark string `json:"remark"`
		}
		json.NewDecoder(r.Body).Decode(&input)

		// Generate order number
		prefix := "DD-" + strings.ReplaceAll(input.OrderDate, "-", "") + "-"
		var maxSeq int
		db.QueryRow("SELECT COALESCE(MAX(CAST(SUBSTR(order_no, LENGTH(?)+1) AS INTEGER)),0) FROM orders WHERE order_no LIKE ?",
			prefix, prefix+"%").Scan(&maxSeq)
		orderNo := fmt.Sprintf("%s%03d", prefix, maxSeq+1)

		totalQty := 0
		totalAmount := 0.0
		for _, it := range input.Items {
			totalQty += it.Qty
			totalAmount += it.Amount
		}
		totalAmount = math.Round(totalAmount*100) / 100
		amountCN := amountToChinese(totalAmount)

		res, _ := db.Exec("INSERT INTO orders(order_no,order_date,total_qty,total_amount,amount_cn,remark) VALUES(?,?,?,?,?,?)",
			orderNo, input.OrderDate, totalQty, totalAmount, amountCN, input.Remark)
		orderID, _ := res.LastInsertId()

		for i, it := range input.Items {
			db.Exec("INSERT INTO order_items(order_id,row_num,product_name,spec,unit,qty,price,amount,remark) VALUES(?,?,?,?,?,?,?,?,?)",
				orderID, i+1, it.ProductName, it.Spec, it.Unit, it.Qty, it.Price, math.Round(it.Amount*100)/100, it.Remark)
		}

		var order Order
		db.QueryRow("SELECT * FROM orders WHERE id=?", orderID).Scan(&order.ID, &order.OrderNo, &order.OrderDate, &order.TotalQty, &order.TotalAmount, &order.AmountCN, &order.Remark, &order.CreatedAt)
		order.Items = loadOrderItems(int(orderID))
		w.WriteHeader(201)
		writeJSON(w, order)
	}
}

func handleOrderByID(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/orders/"), "/")
	id, _ := strconv.Atoi(parts[0])

	switch r.Method {
	case "GET":
		var o Order
		err := db.QueryRow("SELECT * FROM orders WHERE id=?", id).Scan(&o.ID, &o.OrderNo, &o.OrderDate, &o.TotalQty, &o.TotalAmount, &o.AmountCN, &o.Remark, &o.CreatedAt)
		if err != nil {
			writeError(w, 404, "单据不存在")
			return
		}
		o.Items = loadOrderItems(id)
		writeJSON(w, o)

	case "DELETE":
		db.Exec("DELETE FROM order_items WHERE order_id=?", id)
		db.Exec("DELETE FROM orders WHERE id=?", id)
		writeJSON(w, map[string]string{"message": "ok"})
	}
}

func loadOrderItems(orderID int) []OrderItem {
	rows, _ := db.Query("SELECT * FROM order_items WHERE order_id=? ORDER BY row_num", orderID)
	defer rows.Close()
	items := []OrderItem{}
	for rows.Next() {
		var it OrderItem
		rows.Scan(&it.ID, &it.OrderID, &it.RowNum, &it.ProductName, &it.Spec, &it.Unit, &it.Qty, &it.Price, &it.Amount, &it.Remark)
		items = append(items, it)
	}
	return items
}

// ---- Dashboard ----

func handleDashboard(w http.ResponseWriter, r *http.Request) {
	today := time.Now().Format("2006-01-02")
	monthStart := time.Now().Format("2006-01") + "-01"

	var todayOrders int
	var todayAmount float64
	db.QueryRow("SELECT COUNT(*), COALESCE(SUM(total_amount),0) FROM orders WHERE order_date=?", today).Scan(&todayOrders, &todayAmount)

	var monthOrders int
	var monthAmount float64
	db.QueryRow("SELECT COUNT(*), COALESCE(SUM(total_amount),0) FROM orders WHERE order_date>=? AND order_date<=?", monthStart, today).Scan(&monthOrders, &monthAmount)

	rows, _ := db.Query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5")
	defer rows.Close()
	recent := []Order{}
	for rows.Next() {
		var o Order
		rows.Scan(&o.ID, &o.OrderNo, &o.OrderDate, &o.TotalQty, &o.TotalAmount, &o.AmountCN, &o.Remark, &o.CreatedAt)
		recent = append(recent, o)
	}

	writeJSON(w, DashboardData{
		TodayOrders:  todayOrders,
		TodayAmount:  math.Round(todayAmount*100) / 100,
		MonthOrders:  monthOrders,
		MonthAmount:  math.Round(monthAmount*100) / 100,
		RecentOrders: recent,
	})
}

func handleCharts(w http.ResponseWriter, r *http.Request) {
	today := time.Now()
	monthStart := time.Date(today.Year(), today.Month(), 1, 0, 0, 0, 0, today.Location())

	dailySales := []DailySale{}
	for d := monthStart; !d.After(today); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")
		var orders int
		var amount float64
		db.QueryRow("SELECT COUNT(*), COALESCE(SUM(total_amount),0) FROM orders WHERE order_date=?", dateStr).Scan(&orders, &amount)
		dailySales = append(dailySales, DailySale{Date: dateStr, Amount: math.Round(amount*100) / 100, Orders: orders})
	}

	rows, _ := db.Query(`SELECT oi.product_name, SUM(oi.qty) as total_qty, SUM(oi.amount) as total_amount
		FROM order_items oi JOIN orders o ON oi.order_id=o.id
		WHERE o.order_date>=? AND o.order_date<=?
		GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 10`, monthStart.Format("2006-01-02"), today.Format("2006-01-02"))
	defer rows.Close()
	topProducts := []TopProduct{}
	for rows.Next() {
		var tp TopProduct
		rows.Scan(&tp.Name, &tp.TotalQty, &tp.TotalAmount)
		tp.TotalAmount = math.Round(tp.TotalAmount*100) / 100
		topProducts = append(topProducts, tp)
	}

	writeJSON(w, ChartData{DailySales: dailySales, TopProducts: topProducts})
}

// ---- Import/Export ----

func handleExportProducts(w http.ResponseWriter, r *http.Request) {
	format := r.URL.Query().Get("fmt")
	rows, _ := db.Query("SELECT * FROM products ORDER BY id")
	defer rows.Close()

	headers := []string{"ID", "品名", "规格型号", "单位", "参考单价"}
	data := [][]string{}
	for rows.Next() {
		var p Product
		rows.Scan(&p.ID, &p.Name, &p.Spec, &p.Unit, &p.ReferencePrice, &p.CreatedAt, &p.UpdatedAt)
		data = append(data, []string{strconv.Itoa(p.ID), p.Name, p.Spec, p.Unit, fmt.Sprintf("%.2f", p.ReferencePrice)})
	}

	if format == "xlsx" {
		exportXLSX(w, "products.xlsx", headers, data)
	} else {
		exportCSV(w, "products.csv", headers, data)
	}
}

func handleExportOrders(w http.ResponseWriter, r *http.Request) {
	format := r.URL.Query().Get("fmt")
	rows, _ := db.Query(`SELECT o.order_no, o.order_date, o.total_qty, o.total_amount, o.amount_cn,
		oi.row_num, oi.product_name, oi.spec, oi.unit, oi.qty, oi.price, oi.amount, oi.remark
		FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id ORDER BY o.id, oi.row_num`)
	defer rows.Close()

	headers := []string{"单号", "日期", "总数量", "总金额", "大写金额", "行号", "品名", "规格", "单位", "数量", "单价", "金额", "备注"}
	data := [][]string{}
	for rows.Next() {
		var orderNo, orderDate, amountCN, prodName, spec, unit, remark sql.NullString
		var totalQty, rowNum, qty sql.NullInt64
		var totalAmount, price, amount sql.NullFloat64
		rows.Scan(&orderNo, &orderDate, &totalQty, &totalAmount, &amountCN, &rowNum, &prodName, &spec, &unit, &qty, &price, &amount, &remark)
		ns := func(s sql.NullString) string { if s.Valid { return s.String }; return "" }
		ni := func(s sql.NullInt64) string { if s.Valid { return strconv.Itoa(int(s.Int64)) }; return "" }
		nf := func(s sql.NullFloat64) string { if s.Valid { return fmt.Sprintf("%.2f", s.Float64) }; return "" }
		data = append(data, []string{ns(orderNo), ns(orderDate), ni(totalQty), nf(totalAmount), ns(amountCN),
			ni(rowNum), ns(prodName), ns(spec), ns(unit), ni(qty), nf(price), nf(amount), ns(remark)})
	}

	if format == "xlsx" {
		exportXLSX(w, "orders.xlsx", headers, data)
	} else {
		exportCSV(w, "orders.csv", headers, data)
	}
}

func handleExportDatabase(w http.ResponseWriter, r *http.Request) {
	exePath, _ := os.Executable()
	dbPath := filepath.Join(filepath.Dir(exePath), "dudu_pos.db")
	http.ServeFile(w, r, dbPath)
}

func handleImportProducts(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	file, _, _ := r.FormFile("file")
	if file == nil {
		writeError(w, 400, "No file")
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	headers, _ := reader.Read()

	idxName := findCol(headers, "品名", "name")
	idxSpec := findCol(headers, "规格型号", "规格", "spec")
	idxUnit := findCol(headers, "单位", "unit")
	idxPrice := findCol(headers, "参考单价", "单价", "price")

	if idxName < 0 {
		writeError(w, 400, "缺少「品名」列")
		return
	}

	imported := 0
	for {
		row, err := reader.Read()
		if err != nil {
			break
		}
		name := getCol(row, idxName)
		if name == "" {
			continue
		}
		spec := getCol(row, idxSpec)
		unit := getCol(row, idxUnit)
		if unit == "" {
			unit = "箱"
		}
		price, _ := strconv.ParseFloat(getCol(row, idxPrice), 64)

		var exists int
		db.QueryRow("SELECT COUNT(*) FROM products WHERE name=?", name).Scan(&exists)
		if exists > 0 {
			continue
		}
		db.Exec("INSERT INTO products(name,spec,unit,reference_price) VALUES(?,?,?,?)", name, spec, unit, price)
		imported++
	}
	writeJSON(w, map[string]interface{}{"message": fmt.Sprintf("成功导入 %d 个商品", imported), "imported": imported})
}

func handleImportOrders(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	file, _, _ := r.FormFile("file")
	if file == nil {
		writeError(w, 400, "No file")
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	headers, _ := reader.Read()

	idxOrderNo := findCol(headers, "单号", "order_no")
	idxDate := findCol(headers, "日期", "order_date")
	idxProduct := findCol(headers, "品名", "product_name")
	idxSpec := findCol(headers, "规格", "spec")
	idxUnit := findCol(headers, "单位", "unit")
	idxQty := findCol(headers, "数量", "qty")
	idxPrice := findCol(headers, "单价", "price")
	idxAmount := findCol(headers, "金额", "amount")
	idxRemark := findCol(headers, "备注", "remark")

	if idxOrderNo < 0 || idxProduct < 0 {
		writeError(w, 400, "缺少必要列")
		return
	}

	type itemData struct {
		productName string
		spec        string
		unit        string
		qty         int
		price       float64
		amount      float64
		remark      string
	}
	ordersMap := map[string]struct {
		date  string
		items []itemData
	}{}

	for {
		row, err := reader.Read()
		if err != nil {
			break
		}
		orderNo := getCol(row, idxOrderNo)
		if orderNo == "" {
			continue
		}
		if _, ok := ordersMap[orderNo]; !ok {
			ordersMap[orderNo] = struct {
				date  string
				items []itemData
			}{date: getCol(row, idxDate), items: []itemData{}}
		}
		entry := ordersMap[orderNo]
		qty, _ := strconv.Atoi(getCol(row, idxQty))
		price, _ := strconv.ParseFloat(getCol(row, idxPrice), 64)
		amount, _ := strconv.ParseFloat(getCol(row, idxAmount), 64)
		if amount == 0 {
			amount = float64(qty) * price
		}
		entry.items = append(entry.items, itemData{
			productName: getCol(row, idxProduct),
			spec:        getCol(row, idxSpec),
			unit:        getCol(row, idxUnit),
			qty:         qty,
			price:       price,
			amount:      amount,
			remark:      getCol(row, idxRemark),
		})
		ordersMap[orderNo] = entry
	}

	imported := 0
	for orderNo, entry := range ordersMap {
		var exists int
		db.QueryRow("SELECT COUNT(*) FROM orders WHERE order_no=?", orderNo).Scan(&exists)
		if exists > 0 {
			continue
		}
		totalQty := 0
		totalAmount := 0.0
		for _, it := range entry.items {
			totalQty += it.qty
			totalAmount += it.amount
		}
		date := entry.date
		if date == "" {
			date = time.Now().Format("2006-01-02")
		}
		res, _ := db.Exec("INSERT INTO orders(order_no,order_date,total_qty,total_amount) VALUES(?,?,?,?)",
			orderNo, date, totalQty, totalAmount)
		orderID, _ := res.LastInsertId()
		for i, it := range entry.items {
			db.Exec("INSERT INTO order_items(order_id,row_num,product_name,spec,unit,qty,price,amount,remark) VALUES(?,?,?,?,?,?,?,?,?)",
				orderID, i+1, it.productName, it.spec, it.unit, it.qty, it.price, it.amount, it.remark)
		}
		imported++
	}
	writeJSON(w, map[string]interface{}{"message": fmt.Sprintf("成功导入 %d 张单据", imported), "imported": imported})
}

// ---- Helpers ----

func findCol(headers []string, aliases ...string) int {
	for _, alias := range aliases {
		for i, h := range headers {
			if strings.TrimSpace(h) == alias {
				return i
			}
		}
	}
	return -1
}

func getCol(row []string, idx int) string {
	if idx >= 0 && idx < len(row) {
		return strings.TrimSpace(row[idx])
	}
	return ""
}

func exportCSV(w http.ResponseWriter, filename string, headers []string, rows [][]string) {
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Write([]byte{0xEF, 0xBB, 0xBF}) // BOM for Excel
	wr := csv.NewWriter(w)
	wr.Write(headers)
	wr.WriteAll(rows)
	wr.Flush()
}

func exportXLSX(w http.ResponseWriter, filename string, headers []string, rows [][]string) {
	f := excelize.NewFile()
	sheet := "Sheet1"
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}
	for ri, row := range rows {
		for ci, val := range row {
			cell, _ := excelize.CoordinatesToCellName(ci+1, ri+2)
			f.SetCellValue(sheet, cell, val)
		}
	}
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	f.Write(w)
}
