@echo off
REM Simple batch script to clean localhost references for production

echo.
echo ================================================
echo  KILANG PRODUCTION CLEANUP
echo ================================================
echo.

set VPS_URL=http://72.62.67.167

echo Cleaning frontend-admin...
if exist frontend-admin (
    cd frontend-admin

    REM Create production .env
    echo # Production Environment Variables > .env
    echo NEXT_PUBLIC_API_URL=%VPS_URL%/api/v1 >> .env
    echo NEXT_PUBLIC_MINIO_URL=%VPS_URL%/storage >> .env
    echo NEXT_PUBLIC_USE_MOCK=false >> .env
    echo NODE_ENV=production >> .env

    REM Remove dev files
    if exist .env.local del .env.local
    if exist .env.development del .env.development

    cd ..
    echo [OK] frontend-admin cleaned
)

echo Cleaning frontend-storefront...
if exist frontend-storefront (
    cd frontend-storefront

    REM Create production .env
    echo # Production Environment Variables > .env
    echo NEXT_PUBLIC_API_URL=%VPS_URL%/api/v1 >> .env
    echo NEXT_PUBLIC_MINIO_URL=%VPS_URL%/storage >> .env
    echo NEXT_PUBLIC_USE_MOCK=false >> .env
    echo NODE_ENV=production >> .env

    REM Remove dev files
    if exist .env.local del .env.local
    if exist .env.development del .env.development

    cd ..
    echo [OK] frontend-storefront cleaned
)

echo Cleaning frontend-warehouse...
if exist frontend-warehouse (
    cd frontend-warehouse

    REM Create production .env
    echo # Production Environment Variables > .env
    echo NEXT_PUBLIC_API_URL=%VPS_URL%/api/v1 >> .env
    echo NEXT_PUBLIC_MINIO_URL=%VPS_URL%/storage >> .env
    echo NEXT_PUBLIC_USE_MOCK=false >> .env
    echo NODE_ENV=production >> .env

    REM Remove dev files
    if exist .env.local del .env.local
    if exist .env.development del .env.development

    cd ..
    echo [OK] frontend-warehouse cleaned
)

echo.
echo ================================================
echo  CLEANUP COMPLETE
echo ================================================
echo.
echo All frontend applications configured for production!
echo.
echo Next steps:
echo 1. Commit changes: git add -A ^&^& git commit -m "Clean for production"
echo 2. Deploy: ./deploy-to-vps.sh all
echo 3. Test: http://72.62.67.167/admin/login
echo.
pause