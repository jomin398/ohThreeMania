@echo off
setlocal

:: ���� ��ũ��Ʈ ������ ��ġ�� ã���ϴ�.
set "scriptDir=%~dp0"

:: Chrome�� �⺻ ��θ� �����մϴ�.
set "chromePath=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

:: Chrome�� �⺻ ��ο� ���� ���, �ٸ� ��θ� �õ��մϴ�.
if not exist "%chromePath%" set "chromePath=C:\Program Files\Google\Chrome\Application\chrome.exe"

:: ������ ������ �������� ������ ����ڿ��� �˸��ϴ�.
if not exist "%chromePath%" (
    echo Chrome�� ã�� �� �����ϴ�. Chrome�� ��ġ�Ǿ� �ִ��� Ȯ�����ּ���.
    goto end
)

:: index.html ������ ��θ� �����մϴ�.
set "indexPath=%scriptDir%index.html"

:: �ٷΰ��� �̸��� ���մϴ�.
set "shortcutName=���ӽ���.lnk"

:: Chrome�� �߰� �ƱԸ�Ʈ�� �����մϴ�.
set "chromeArgs=--disable-web-security --user-data-dir=%TEMP%\Google\chromeTemp --allow-file-access-from-files --incognito --new-window"

:: �ٷΰ��⸦ �����մϴ�.
echo ����ȭ�鿡 index.html�� �ٷΰ��⸦ �����մϴ�...
powershell.exe -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%scriptDir%%shortcutName%'); $sc.TargetPath = '%chromePath%'; $sc.Arguments = '%chromeArgs% ""%indexPath%""'; $sc.Save()"
echo �ٷΰ��Ⱑ �����Ǿ����ϴ�.
goto end

:end
start explorer "%scriptDir%"
pause
endlocal
