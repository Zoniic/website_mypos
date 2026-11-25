$log = "d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\bug-scan\scan-log.txt"
for ($i = 0; $i -lt 55; $i++) {
  if (Select-String -Path $log -Pattern '^exit=' -Quiet) { break }
  Start-Sleep 30
}
