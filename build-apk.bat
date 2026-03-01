@echo off
echo ========================================
echo     简易记账本 - APK打包工具
echo ========================================
echo.
echo 请选择打包方式:
echo.
echo 1. 使用PWA Builder在线打包 (推荐)
echo    - 需要先将应用部署到公网
echo    - 完全免费
echo.
echo 2. 使用Android Studio打包
echo    - 需要安装Android Studio
echo    - 可以自定义签名
echo.
echo 3. 启动本地服务器 (用于测试)
echo.
set /p choice="请输入选项 (1/2/3): "

if "%choice%"=="1" goto pwabuilder
if "%choice%"=="2" goto android_studio
if "%choice%"=="3" goto local_server
goto end

:pwabuilder
echo.
echo 正在打开PWA Builder...
echo.
echo 步骤:
echo 1. 你需要先将应用部署到公网 (如GitHub Pages, Vercel等)
echo 2. 然后在PWA Builder中输入你的网址
echo 3. 点击生成APK
echo.
echo 正在打开 https://www.pwabuilder.com/
start https://www.pwabuilder.com/
goto end

:android_studio
echo.
echo 正在打开Android Studio...
npx cap open android
goto end

:local_server
echo.
echo 正在启动本地服务器...
echo 服务器地址: http://localhost:8000
echo 在手机浏览器中访问该地址，然后添加到主屏幕即可
echo.
start http://localhost:8000
python -m http.server 8000 2>nul || npx http-server -p 8000
goto end

:end
pause