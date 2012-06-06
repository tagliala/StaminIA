@echo off
echo COMPILING ASSETS
cmd /c lessc ..\less\bootstrap.less ..\css\bootstrap.css
cmd /c lessc ..\less\responsive.less ..\css\bootstrap-responsive.css
coffee -o ..\js -c ..\coffee