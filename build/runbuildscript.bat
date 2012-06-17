@echo off
echo # This is for windows users only.
echo # If you're on a mac or linux, just run `ant build` from this folder in Terminal
echo.
echo # Cleaning old build folders
RD /S /Q ..\intermediate > nul
RD /S /Q ..\publish > nul
echo.

echo # Compiling assets
cmd /c lessc ..\less\bootstrap.less ..\css\bootstrap.css
cmd /c lessc ..\less\responsive.less ..\css\bootstrap-responsive.css
cmd /c coffee -o ..\js -c ..\coffee
echo.

echo # Building Stamin.IA!
set MYDIR=%~dp0
set JAVA_HOME=c:\Program Files (x86)\Java\jdk1.7.0_05
set ANT_OPTS=-D"file.encoding=UTF-8"
cmd /c .\apache-ant-1.8.3\bin\ant minify
echo.

echo # Copying .htaccess
copy /y config\htaccess ..\publish\.htaccess
echo.
