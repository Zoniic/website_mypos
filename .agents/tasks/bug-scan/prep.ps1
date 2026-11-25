# Scratch DB up + sample leads for the admin pages (scratch only). Log: prep-log.txt
Set-Location "d:\Folk\Own_Dir\FMT\DEV\mypos website"
$d = ".agents\tasks\bug-scan"
$log = "$d\prep-log.txt"
docker start mypos-scratch-pg *> $log
for ($i = 0; $i -lt 30; $i++) { docker exec mypos-scratch-pg pg_isready -U scratch *> $null; if ($LASTEXITCODE -eq 0) { "pg ready" | Add-Content $log; break }; Start-Sleep 2 }
$sql = @"
INSERT INTO "ContactMessage" (name, phone, topic, status, message) VALUES ('Sample Lead', '0800000001', 'demo', 'new', 'sample message');
INSERT INTO "WarrantyClaim" (name, phone, email, issue, status, "updatedAt") VALUES ('Sample Claim', '0800000002', 'claim@example.com', 'screen issue', 'open', now());
INSERT INTO "NewsletterSubscriber" (email) VALUES ('sample@example.com') ON CONFLICT DO NOTHING;
INSERT INTO "Order" (number, "accessToken", status, "paymentMethod", locale, "customerName", phone, email, address, postcode, subtotal, "shippingFee", total, "updatedAt")
  VALUES ('MP0000-00001', 'scan-token', 'pending_payment', 'promptpay', 'th', 'Sample Buyer', '0800000003', 'buyer@example.com', 'Bangkok', '10110', 1000, 0, 1000, now()) ON CONFLICT DO NOTHING;
INSERT INTO "OrderItem" ("orderId", kind, slug, name, "unitPrice", quantity) SELECT id, 'accessory', 'mypos-c300h', 'C300H', 1000, 1 FROM "Order" WHERE number = 'MP0000-00001' AND NOT EXISTS (SELECT 1 FROM "OrderItem" oi JOIN "Order" o ON o.id = oi."orderId" WHERE o.number = 'MP0000-00001');
"@
$sql | docker exec -i mypos-scratch-pg psql -U scratch -d mypos_scratch *>> $log
# Names of notification/analytics settings present (values never printed).
docker exec mypos-scratch-pg psql -U scratch -d mypos_scratch -At -c "SELECT key FROM \"SiteSetting\" ORDER BY key" *>> $log
foreach ($f in ".env", ".env.local") { "keys in ${f}:" | Add-Content $log; Get-Content $f | ForEach-Object { if ($_ -match '^([A-Z_]+)=') { $Matches[1] } } | Add-Content $log }
