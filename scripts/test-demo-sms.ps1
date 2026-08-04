$body = '{"pending":3,"overdue":1,"completed":5,"total":9,"courses":4,"userName":"Roy"}'
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseWVtYmFkZGl5YWt4dXZhZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODg3NzEsImV4cCI6MjA5Nzc2NDc3MX0.ffmK3h29al3O7PksBWXzdjEoy7TbnLOmkUSHMatq1P0"
    "Content-Type"  = "application/json"
}
$response = Invoke-RestMethod -Uri "https://jlyembaddiyakxuvaflq.supabase.co/functions/v1/send-demo-sms" -Method POST -Headers $headers -Body $body
$response | ConvertTo-Json
