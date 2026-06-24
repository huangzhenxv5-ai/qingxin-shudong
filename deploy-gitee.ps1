#!/usr/bin/env pwsh
# Gitee Pages 部署脚本
# 将构建产物 dist 目录推送到 gh-pages 分支
#
# 使用方法：
#   pwsh deploy-gitee.ps1
#
# 前置条件：
#   1. 已安装 Node.js 和 pnpm
#   2. 已配置 Gitee 远程仓库
#   3. Gitee 仓库已开启 Pages 服务，部署分支设为 gh-pages

$ErrorActionPreference = "Stop"
Write-Host "===== Gitee Pages 部署脚本 =====" -ForegroundColor Cyan

# 1. 构建项目
Write-Host "`n[1/4] 构建项目..." -ForegroundColor Yellow
node node_modules/vite/bin/vite.js build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}
Write-Host "构建成功！" -ForegroundColor Green

# 2. 准备 dist 目录
Write-Host "`n[2/4] 准备 dist 目录..." -ForegroundColor Yellow
$distPath = "dist"
if (-not (Test-Path $distPath)) {
    Write-Host "dist 目录不存在！" -ForegroundColor Red
    exit 1
}

# 添加 .nojekyll 文件（防止 GitHub/Gitee Pages 忽略下划线开头的文件）
if (-not (Test-Path "$distPath\.nojekyll")) {
    New-Item -Path "$distPath\.nojekyll" -ItemType File -Force | Out-Null
}

# 添加 404.html（SPA 回退，复制 index.html）
if (Test-Path "$distPath\index.html") {
    Copy-Item "$distPath\index.html" "$distPath\404.html" -Force
}

# 3. 切换到 gh-pages 分支
Write-Host "`n[3/4] 推送到 gh-pages 分支..." -ForegroundColor Yellow

# 保存当前分支
$currentBranch = git rev-parse --abbrev-ref HEAD

# 创建临时工作目录
$tempDir = ".gh-pages-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# 克隆 gh-pages 分支（如果存在）或创建新分支
$remoteUrl = git remote get-url origin
Write-Host "远程仓库: $remoteUrl"

# 初始化临时目录
New-Item -ItemType Directory -Path $tempDir | Out-Null
Push-Location $tempDir

try {
    git init
    git config user.name "deploy-bot"
    git config user.email "deploy@local"
    git remote add origin $remoteUrl

    # 尝试拉取 gh-pages 分支
    git fetch origin gh-pages 2>$null
    if ($LASTEXITCODE -eq 0) {
        git checkout gh-pages
        Write-Host "已切换到现有 gh-pages 分支"
    } else {
        git checkout --orphan gh-pages
        Write-Host "创建新的 gh-pages 分支"
    }

    # 清空目录
    Get-ChildItem -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force

    # 复制 dist 内容
    Pop-Location
    Copy-Item "$distPath\*" $tempDir -Recurse -Force
    Push-Location $tempDir

    # 提交并推送
    git add -A
    git commit -m "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin gh-pages --force

    Write-Host "推送成功！" -ForegroundColor Green
} finally {
    Pop-Location
    # 清理临时目录
    Remove-Item $tempDir -Recurse -Force
}

# 4. 完成
Write-Host "`n[4/4] 部署完成！" -ForegroundColor Green
Write-Host "`n下一步：" -ForegroundColor Cyan
Write-Host "  1. 登录 Gitee 仓库"
Write-Host "  2. 服务 -> Gitee Pages"
Write-Host "  3. 部署分支选择 gh-pages"
Write-Host "  4. 部署目录留空（使用根目录）"
Write-Host "  5. 点击启动/更新"
Write-Host "`n访问地址: https://gitee.com/huangzhenxv/qingxin-shudong/pages" -ForegroundColor Cyan
