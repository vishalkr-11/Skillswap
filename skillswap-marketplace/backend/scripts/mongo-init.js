// scripts/mongo-init.js — runs on first container start
db = db.getSiblingDB('skill-exchange');

db.createCollection('users');
db.createCollection('services');
db.createCollection('bookings');
db.createCollection('reviews');
db.createCollection('messages');

print('MongoDB collections initialised for skill-exchange database');
