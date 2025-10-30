@echo off
REM Script para mudar rapidamente de WhatsApp para SMS

echo.
echo ========================================
echo  MUDAR DE WHATSAPP PARA SMS
echo ========================================
echo.

cd /d "%~dp0backend"

if not exist .env (
    echo [ERRO] Arquivo .env nao encontrado!
    echo Execute primeiro: copy .env.example .env
    pause
    exit /b 1
)

echo [1/3] Fazendo backup do .env atual...
copy .env .env.backup.%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2% >nul

echo [2/3] Alterando SMS_CHANNEL para 'sms'...
powershell -Command "(Get-Content .env) -replace '^SMS_CHANNEL=whatsapp', 'SMS_CHANNEL=sms' | Set-Content .env"

echo [3/3] Verificando alteracao...
findstr "SMS_CHANNEL" .env

echo.
echo ========================================
echo  PROXIMO PASSO:
echo ========================================
echo.
echo 1. Edite o arquivo .env e configure:
echo    SMS_FROM_NUMBER=+15551234567  (seu numero Twilio)
echo.
echo 2. Verifique seu numero BR no Twilio:
echo    https://console.twilio.com/us1/develop/phone-numbers/manage/verified
echo.
echo 3. Teste: node teste-sms.js
echo.
echo 4. Inicie: npm start
echo.
pause
