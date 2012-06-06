@echo off
REM # This is for windows users only.
REM # If you're on a mac or linux, just run `ant build` from this folder in Terminal

set MYDIR=%~dp0
set JAVA_HOME=c:\Program Files (x86)\Java\jre7
set ANT_OPTS=-D"file.encoding=UTF-8"
.\apache-ant-1.8.3\bin\ant build minify

