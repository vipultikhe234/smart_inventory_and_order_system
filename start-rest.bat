@echo off
set services=api-gateway user-service product-service inventory-service cart-service order-service

for %%s in (%services%) do (
    echo Starting %%s...
    start "%%s" cmd /c "cd %%s && mvn spring-boot:run > %%s.log 2>&1"
)
