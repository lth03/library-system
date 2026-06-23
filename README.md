# 📚 图书馆管理系统

基于 Vue 3 + Express + MySQL 的图书馆管理应用，支持图书管理、借阅管理、用户管理、仪表盘统计等功能。

## 技术栈

| 层     | 技术                                              |
| ------ | ------------------------------------------------- |
| 前端   | Vue 3 + TypeScript + Pinia + Vue Router + ECharts |
| 后端   | Express 5 + TypeScript + MySQL2 + JWT             |
| 数据库 | MySQL 8.0                                         |
| 部署   | Docker + Nginx                                    |

## 快速启动

```bash
# 安装 Docker（Ubuntu）
curl -fsSL https://get.docker.com | sudo sh

# 构建前端
cd frontend && npm install && npm run build && cd ..

# 启动
docker compose up -d
```

访问 `http://localhost`，管理员账号 `admin` / `admin123`。

详细说明见 [使用指南文档.md](./使用指南文档.md)。

## 项目结构

```
├── backend/          # 后端 API
├── frontend/         # 前端页面
├── mysql/init/       # 数据库初始化
├── nginx/            # Nginx 配置
├── docker-compose.yml
└── 使用指南文档.md
```
