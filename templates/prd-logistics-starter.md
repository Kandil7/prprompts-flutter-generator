---
# Logistics/Delivery App - Real-time Tracking PRD Template
project_name: "DeliveryApp"
project_version: "1.0.0"
created_date: "2025-01-25"
project_type: "logistics"
compliance: ["gdpr"]

platforms: ["ios", "android"]

auth_method: "jwt"
jwt_config:
  algorithm: "RS256"
  access_token_expiry: "8h"  # Delivery drivers work long shifts

sensitive_data: ["location", "pii"]
encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"

offline_support: true  # Critical for areas with poor connectivity
real_time: true  # Real-time location tracking
state_management: "bloc"
architecture_style: "clean_architecture"
backend_type: "rest"

features:
  - name: "Driver Authentication"
    complexity: "medium"
    priority: "p0"
    
  - name: "Real-time GPS Tracking"
    complexity: "high"
    priority: "p0"
    notes: "Background location updates every 30s"
    
  - name: "Route Optimization"
    complexity: "critical"
    priority: "p0"
    notes: "Google Maps Directions API"
    
  - name: "Delivery Proof (Photo + Signature)"
    complexity: "medium"
    priority: "p0"
    
  - name: "Customer Notifications"
    complexity: "low"
    priority: "p0"
    notes: "SMS + Push for delivery status"
    
  - name: "Fleet Management Dashboard"
    complexity: "high"
    priority: "p1"
    notes: "Web dashboard for dispatchers"
    
  - name: "Performance Metrics"
    complexity: "medium"
    priority: "p1"
    notes: "Deliveries per hour, route efficiency"

team_size: "medium"
team_composition:
  mobile:
    size: 4
  backend:
    size: 3
  web:
    size: 2
    
performance_targets:
  location_update_frequency: "30s"
  route_calculation: "< 2s"
  offline_queue_sync: "< 10s when back online"

testing_requirements:
  unit_test_coverage: 80
  integration_tests: "route_calculation, offline_sync"
  
business_context:
  timeline: "6 months"
  mvp_timeline: "3 months"
  target_users: 5000  # Drivers + customers

integrations:
  mapping:
    - name: "Google Maps SDK"
      purpose: "navigation, route_optimization"
  geofencing:
    - name: "Google Geofencing API"
      purpose: "delivery_zone_alerts"
  notifications:
    - name: "Twilio"
      purpose: "sms_notifications"

prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  logistics_specialization: true
---

# Logistics/Delivery App PRD

## Executive Summary
Real-time delivery tracking app with GPS navigation, route optimization, and proof of delivery.

## Key Features
1. **Real-time Tracking** - Live driver location updates every 30 seconds
2. **Route Optimization** - Intelligent routing to minimize delivery time
3. **Proof of Delivery** - Photo + signature capture at delivery
4. **Customer Notifications** - SMS + push for "out for delivery", "delivered"

## Architecture
- Offline-first for poor connectivity areas
- Background location services
- WebSocket for real-time updates
- Google Maps for navigation

## Performance
- Location updates: Every 30 seconds
- Route recalculation: < 2 seconds
- Works offline, syncs when reconnected

Next Steps: Customize for your delivery type (food, packages, etc.), run `claude analyze-prd`
