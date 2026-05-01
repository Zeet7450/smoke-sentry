-- Delete all devices from the database
-- WARNING: This will permanently delete all devices and their associated data

DELETE FROM sensor_readings;
DELETE FROM alerts;
DELETE FROM device_members;
DELETE FROM notifications;
DELETE FROM devices;
