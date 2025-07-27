# Vercel 部署指南

本指南将帮助您将博客项目部署到 Vercel，并配置 Vercel Blob 存储。

## 前置准备

1. 确保您有 Vercel 账户
2. 安装 Vercel CLI：`npm i -g vercel`
3. 准备好数据库（推荐使用 PlanetScale 或 Neon）

## 步骤 1：配置 Vercel Blob 存储

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 创建新项目或选择现有项目
3. 进入项目设置 → Storage → Blob
4. 创建新的 Blob Store
5. 复制生成的 `BLOB_READ_WRITE_TOKEN`

## 步骤 2：设置环境变量

在 Vercel 项目设置中添加以下环境变量：

### 必需的环境变量

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx...

# 数据库连接
DATABASE_URL=postgresql://username:password@host:port/database

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# GraphQL API 端点（生产环境）
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-api-domain.com/graphql
```

### 可选的环境变量

```bash
# 如果使用自定义域名
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 步骤 3：准备数据库

### 使用 PlanetScale（推荐）

1. 创建 [PlanetScale](https://planetscale.com/) 账户
2. 创建新数据库
3. 获取连接字符串
4. 运行数据库迁移：

```bash
npx prisma db push
```

### 使用 Neon

1. 创建 [Neon](https://neon.tech/) 账户
2. 创建新项目
3. 获取连接字符串
4. 运行数据库迁移

## 步骤 4：部署到 Vercel

### 方法 1：通过 Git 自动部署

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel Dashboard 中导入项目
3. 配置环境变量
4. 部署

### 方法 2：使用 Vercel CLI

```bash
# 登录 Vercel
vercel login

# 部署项目
vercel

# 设置环境变量
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add DATABASE_URL
vercel env add JWT_SECRET

# 重新部署
vercel --prod
```

## 步骤 5：配置域名（可选）

1. 在 Vercel Dashboard 中添加自定义域名
2. 配置 DNS 记录
3. 更新 `NEXT_PUBLIC_SITE_URL` 环境变量

## 步骤 6：设置 GraphQL API

由于这是一个全栈应用，您需要单独部署 GraphQL API 服务器：

### 选项 1：部署到 Railway

1. 创建 [Railway](https://railway.app/) 账户
2. 连接 GitHub 仓库
3. 选择 `server` 目录
4. 配置环境变量
5. 部署

### 选项 2：部署到 Heroku

1. 创建 Heroku 应用
2. 配置环境变量
3. 部署 server 目录

### 选项 3：使用 Vercel Functions

将 GraphQL API 转换为 Vercel Functions（需要额外配置）

## 文件上传功能说明

### 新的上传流程

1. **前端**：使用 `/api/upload` 端点
2. **存储**：文件直接上传到 Vercel Blob
3. **数据库**：文件元数据存储在数据库中
4. **访问**：通过 Vercel Blob CDN 访问文件

### 优势

- ✅ 无需管理文件存储服务器
- ✅ 全球 CDN 加速
- ✅ 自动压缩和优化
- ✅ 高可用性和可扩展性

## 环境变量完整列表

```bash
# === 必需变量 ===
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-api.com/graphql

# === 可选变量 ===
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

## 故障排除

### 常见问题

1. **文件上传失败**
   - 检查 `BLOB_READ_WRITE_TOKEN` 是否正确
   - 确认文件大小不超过限制

2. **数据库连接失败**
   - 检查 `DATABASE_URL` 格式
   - 确认数据库服务正常运行

3. **认证失败**
   - 检查 `JWT_SECRET` 是否一致
   - 确认 token 格式正确

### 调试技巧

1. 查看 Vercel 函数日志
2. 使用 `console.log` 调试
3. 检查网络请求

## 性能优化

1. **图片优化**：使用 Next.js Image 组件
2. **缓存策略**：配置适当的缓存头
3. **代码分割**：使用动态导入

## 安全考虑

1. **环境变量**：不要在客户端暴露敏感信息
2. **文件上传**：验证文件类型和大小
3. **认证**：使用强密码和安全的 JWT 密钥

## 监控和维护

1. 设置 Vercel Analytics
2. 监控 Blob 存储使用量
3. 定期备份数据库
4. 更新依赖包

---

部署完成后，您的博客将具备：
- 🚀 快速的全球访问速度
- 📁 可靠的文件存储
- 🔒 安全的用户认证
- 📱 响应式设计
- 🎨 现代化的 UI/UX