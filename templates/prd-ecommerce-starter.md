---
# E-commerce App - PCI-DSS PRD Template  
project_name: "ShopApp"
project_version: "1.0.0"
created_date: "2025-01-25"
project_type: "ecommerce"
compliance: ["pci-dss", "gdpr"]

platforms: ["ios", "android", "web"]

auth_method: "oauth2"
oauth2_config:
  providers: ["google", "apple", "email"]

sensitive_data: ["payment", "pii"]
encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"

offline_support: true
real_time: true
state_management: "riverpod"
architecture_style: "clean_architecture"
backend_type: "rest"

features:
  - name: "Product Catalog & Search"
    complexity: "medium"
    priority: "p0"
    
  - name: "Shopping Cart"
    complexity: "medium"
    priority: "p0"
    
  - name: "Checkout & Payment"
    complexity: "critical"
    priority: "p0"
    pci_controls: ["tokenization", "no_card_storage"]
    notes: "Use Stripe - NEVER store card numbers"
    
  - name: "Order Management"
    complexity: "medium"
    priority: "p0"
    
  - name: "User Reviews & Ratings"
    complexity: "low"
    priority: "p1"
    
  - name: "Push Notifications (Order Updates)"
    complexity: "low"
    priority: "p1"
    
  - name: "Wishlist"
    complexity: "low"
    priority: "p2"

team_size: "medium"
team_composition:
  mobile:
    size: 5
  backend:
    size: 4
  qa:
    size: 2
    
pci_dss_requirements:
  tokenization_provider: "stripe"
  never_store_card_numbers: true
  saq_level: "A"

performance_targets:
  product_list_load: "1s"
  search_response: "300ms"
  checkout_flow: "< 60s total"

testing_requirements:
  unit_test_coverage: 85
  payment_flow_tests: "all_scenarios"
  
business_context:
  timeline: "6 months"
  mvp_timeline: "3 months"
  target_users: 100000

integrations:
  payment:
    - name: "Stripe"
      purpose: "payment_processing"
  shipping:
    - name: "Shippo"
      purpose: "shipping_labels"
  analytics:
    - name: "Firebase Analytics"

prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  ecommerce_specialization: true
---

# E-commerce App PRD

## Executive Summary
PCI-DSS compliant mobile shopping app with secure payment processing, product catalog, and order management.

## Key Features
1. **Product Catalog** - Browse, search, filter products
2. **Shopping Cart** - Add/remove items, apply promo codes
3. **Secure Checkout** - Stripe tokenization, multiple payment methods
4. **Order Tracking** - Real-time order status, shipping updates

## Payment Security (PCI-DSS)
- Tokenization via Stripe (SAQ Level A)
- NEVER store credit card numbers
- TLS 1.3 for all transactions
- Quarterly security audits

## Performance
- Product images: Lazy loading, cached
- Search: < 300ms response time
- Checkout: Complete in < 60 seconds

Next Steps: Customize product categories, then run `claude analyze-prd`
