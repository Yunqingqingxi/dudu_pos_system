# 嘟嘟 POS 系统

广信区都嘟百货店 — 小型销售开单管理系统。

## 功能

- **销售开单**：动态增删商品行，自动计算金额，中文大写金额转换
- **商品库管理**：品名、规格、单位、参考单价的增删改查
- **历史单据**：按日期、单号筛选查询
- **打印输出**：浏览器打印，模板模拟纸质三联单样式
- **仪表板**：今日/本月销售额统计

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| 后端 | Python FastAPI + SQLAlchemy |
| 数据库 | SQLite |
| 打印 | 浏览器 `window.print()` |

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+

### 一键启动（Windows）

双击项目根目录下的 `start.bat`。

### 手动启动

```bash
# 1. 安装后端依赖并启动
cd backend
pip install -r requirements.txt
python seed.py           # 导入示例商品数据
python -m uvicorn main:app --port 8000

# 2. 安装前端依赖并启动
cd frontend
npm install
npm run dev
```

### 访问

- 前端界面：http://localhost:5173
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

## 项目结构

```
dudu_pos_system/
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── database.py          # 数据库连接
│   ├── models.py            # SQLAlchemy 模型
│   ├── schemas.py           # Pydantic 校验
│   ├── routers/             # API 路由
│   ├── services/            # 业务逻辑
│   ├── seed.py              # 种子数据
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # UI & 业务组件
│   │   ├── api/             # API 客户端
│   │   ├── lib/             # 工具函数（含中文大写转换）
│   │   └── types/           # TypeScript 类型
│   └── package.json
├── start.bat                # Windows 一键启动
└── README.md
```

## 数据备份

SQLite 数据库文件位于 `backend/dudu_pos.db`，复制此文件即可完成备份。
