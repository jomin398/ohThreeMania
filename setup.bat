@echo off
rd /s /q .git
rd /s /q test
rd /s /q res
del /q .gitignore
del /q exeMakerInfo.ini
call shotCutMaker.bat
start /b "" cmd /c del "shotCutMaker.bat" & del "%~f0" & exit /b