param([string]$Sql)
docker exec mypos-scratch-pg psql -U scratch -d mypos_scratch -At -c $Sql *> "d:\Folk\Own_Dir\FMT\DEV\mypos website\.agents\tasks\bug-scan\q-out.txt"
