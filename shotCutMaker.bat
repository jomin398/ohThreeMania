@echo off
setlocal

:: 현재 스크립트 파일의 위치를 찾습니다.
set "scriptDir=%~dp0"

:: Chrome의 기본 경로를 설정합니다.
set "chromePath=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

:: Chrome이 기본 경로에 없는 경우, 다른 경로를 시도합니다.
if not exist "%chromePath%" set "chromePath=C:\Program Files\Google\Chrome\Application\chrome.exe"

:: 파일이 여전히 존재하지 않으면 사용자에게 알립니다.
if not exist "%chromePath%" (
    echo Chrome을 찾을 수 없습니다. Chrome이 설치되어 있는지 확인해주세요.
    goto end
)

:: index.html 파일의 경로를 설정합니다.
set "indexPath=%scriptDir%index.html"

:: 바로가기 이름을 정합니다.
set "shortcutName=게임시작.lnk"

:: Chrome의 추가 아규먼트를 설정합니다.
set "chromeArgs=--disable-web-security --user-data-dir=%TEMP%\Google\chromeTemp --allow-file-access-from-files --incognito --new-window"

:: 바로가기를 생성합니다.
echo 바탕화면에 index.html의 바로가기를 생성합니다...
powershell.exe -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%scriptDir%%shortcutName%'); $sc.TargetPath = '%chromePath%'; $sc.Arguments = '%chromeArgs% ""%indexPath%""'; $sc.Save()"
echo 바로가기가 생성되었습니다.
goto end

:end
start explorer "%scriptDir%"
pause
endlocal
