@IF EXIST "%~dp0\node.exe" (
    "%~dp0\node.exe" "--harmony" "%~dp0\node_modules\snoo\cli.js" %*
) ELSE (
    node "--harmony" "%~dp0\node_modules\snoo\cli.js" %*
)
