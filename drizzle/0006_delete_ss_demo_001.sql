-- Delete specific device SS-DEMO-001 and all related data
DELETE FROM sensor_readings WHERE device_id IN (SELECT id FROM devices WHERE device_code = 'SS-DEMO-001');
DELETE FROM alerts WHERE device_id IN (SELECT id FROM devices WHERE device_code = 'SS-DEMO-001');
DELETE FROM device_members WHERE device_id IN (SELECT id FROM devices WHERE device_code = 'SS-DEMO-001');
DELETE FROM devices WHERE device_code = 'SS-DEMO-001';
