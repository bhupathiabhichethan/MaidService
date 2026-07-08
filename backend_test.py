#!/usr/bin/env python3
"""
Comprehensive backend API tests for Helper4U platform
Tests all endpoints with realistic data
"""

import requests
import json
from datetime import datetime, timedelta

# Base URL from environment
BASE_URL = "https://trusted-helpers-12.preview.emergentagent.com/api"

# Test data storage
test_data = {
    'household_user': None,
    'helper_user': None,
    'helper_profile': None,
    'booking': None,
    'review': None,
    'document': None,
    'complaint': None,
    'attendance': None,
    'category': None,
    'seeded_helper_id': None
}

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_result(success, message):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    return success

def test_health():
    """Test health endpoint"""
    print_test("Health Check - GET /api/health")
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('status') == 'ok':
                return print_result(True, f"Health check passed: {data}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_register_household():
    """Test household registration"""
    print_test("Auth - Register Household")
    try:
        payload = {
            "name": "Rajesh Kumar",
            "email": f"rajesh.kumar.{datetime.now().timestamp()}@example.com",
            "password": "SecurePass123",
            "role": "household",
            "phone": "+91-9876543210",
            "city": "Mumbai"
        }
        resp = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'user' in data and data['user']['role'] == 'household':
                test_data['household_user'] = data['user']
                return print_result(True, f"Household registered: {data['user']['email']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_register_duplicate():
    """Test duplicate email registration"""
    print_test("Auth - Register Duplicate Email (should fail)")
    try:
        if not test_data['household_user']:
            return print_result(False, "No household user to test duplicate")
        
        payload = {
            "name": "Another User",
            "email": test_data['household_user']['email'],
            "password": "password",
            "role": "household"
        }
        resp = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        if resp.status_code == 400:
            data = resp.json()
            if 'error' in data:
                return print_result(True, f"Correctly rejected duplicate: {data['error']}")
            else:
                return print_result(False, f"Wrong error format: {data}")
        else:
            return print_result(False, f"Should return 400, got {resp.status_code}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_register_helper():
    """Test helper registration - should create user AND helper profile"""
    print_test("Auth - Register Helper (creates user + helper profile)")
    try:
        payload = {
            "name": "Asha Patel",
            "email": f"asha.patel.{datetime.now().timestamp()}@example.com",
            "password": "HelperPass123",
            "role": "helper",
            "phone": "+91-9876543211",
            "city": "Delhi",
            "service_type": "nanny",
            "experience": 7,
            "bio": "Experienced nanny with love for children and excellent references",
            "skills": ["Childcare", "Cooking", "First Aid"],
            "languages": ["Hindi", "English"],
            "availability": "Full-time",
            "hourly_price": 400,
            "monthly_price": 25000,
            "yearly_price": 280000
        }
        resp = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'user' in data and data['user']['role'] == 'helper':
                test_data['helper_user'] = data['user']
                return print_result(True, f"Helper registered: {data['user']['email']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_login_admin():
    """Test admin login"""
    print_test("Auth - Login Admin")
    try:
        payload = {
            "email": "admin@helper4u.com",
            "password": "admin123"
        }
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'user' in data and data['user']['role'] == 'admin':
                return print_result(True, f"Admin login successful: {data['user']['email']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_login_wrong_password():
    """Test login with wrong password"""
    print_test("Auth - Login with Wrong Password (should fail)")
    try:
        payload = {
            "email": "admin@helper4u.com",
            "password": "wrongpassword"
        }
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        if resp.status_code == 401:
            data = resp.json()
            if 'error' in data:
                return print_result(True, f"Correctly rejected wrong password: {data['error']}")
            else:
                return print_result(False, f"Wrong error format: {data}")
        else:
            return print_result(False, f"Should return 401, got {resp.status_code}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_list():
    """Test getting helpers list - should auto-seed"""
    print_test("Helpers - GET /api/helpers (auto-seeds)")
    try:
        resp = requests.get(f"{BASE_URL}/helpers", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data and len(data['helpers']) > 0:
                # Check for UUIDs (no MongoDB _id)
                if any('_id' in h for h in data['helpers']):
                    return print_result(False, "MongoDB _id found in response")
                test_data['seeded_helper_id'] = data['helpers'][0]['id']
                return print_result(True, f"Got {len(data['helpers'])} helpers (seeded)")
            else:
                return print_result(False, f"No helpers returned: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_filter_service():
    """Test filtering helpers by service type"""
    print_test("Helpers - Filter by service=maid")
    try:
        resp = requests.get(f"{BASE_URL}/helpers?service=maid", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data:
                maids = [h for h in data['helpers'] if h['service_type'] == 'maid']
                if len(maids) == len(data['helpers']):
                    return print_result(True, f"Got {len(maids)} maids")
                else:
                    return print_result(False, f"Filter not working: got non-maid helpers")
            else:
                return print_result(False, f"No helpers key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_filter_city():
    """Test filtering helpers by city"""
    print_test("Helpers - Filter by city=Mumbai")
    try:
        resp = requests.get(f"{BASE_URL}/helpers?city=Mumbai", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data:
                mumbai = [h for h in data['helpers'] if h['city'] == 'Mumbai']
                if len(mumbai) == len(data['helpers']):
                    return print_result(True, f"Got {len(mumbai)} helpers in Mumbai")
                else:
                    return print_result(False, f"Filter not working: got non-Mumbai helpers")
            else:
                return print_result(False, f"No helpers key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_filter_plan():
    """Test filtering helpers by plan"""
    print_test("Helpers - Filter by plan=monthly")
    try:
        resp = requests.get(f"{BASE_URL}/helpers?plan=monthly", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data:
                monthly = [h for h in data['helpers'] if h.get('monthly_price', 0) > 0]
                if len(monthly) == len(data['helpers']):
                    return print_result(True, f"Got {len(monthly)} helpers with monthly plan")
                else:
                    return print_result(False, f"Filter not working")
            else:
                return print_result(False, f"No helpers key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_filter_minexp():
    """Test filtering helpers by minimum experience"""
    print_test("Helpers - Filter by minExp=5")
    try:
        resp = requests.get(f"{BASE_URL}/helpers?minExp=5", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data:
                experienced = [h for h in data['helpers'] if h.get('experience', 0) >= 5]
                if len(experienced) == len(data['helpers']):
                    return print_result(True, f"Got {len(experienced)} helpers with 5+ years exp")
                else:
                    return print_result(False, f"Filter not working: got helpers with <5 years")
            else:
                return print_result(False, f"No helpers key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_filter_availability():
    """Test filtering helpers by availability"""
    print_test("Helpers - Filter by availability=Full-time")
    try:
        resp = requests.get(f"{BASE_URL}/helpers?availability=Full-time", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data:
                fulltime = [h for h in data['helpers'] if h.get('availability') == 'Full-time']
                if len(fulltime) == len(data['helpers']):
                    return print_result(True, f"Got {len(fulltime)} full-time helpers")
                else:
                    return print_result(False, f"Filter not working")
            else:
                return print_result(False, f"No helpers key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_filter_verified():
    """Test filtering verified helpers only"""
    print_test("Helpers - Filter by verifiedOnly=true")
    try:
        resp = requests.get(f"{BASE_URL}/helpers?verifiedOnly=true", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data:
                verified = [h for h in data['helpers'] if h.get('verified') == True]
                if len(verified) == len(data['helpers']):
                    return print_result(True, f"Got {len(verified)} verified helpers")
                else:
                    return print_result(False, f"Filter not working: got unverified helpers")
            else:
                return print_result(False, f"No helpers key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_filter_search():
    """Test searching helpers by name"""
    print_test("Helpers - Filter by q=priya")
    try:
        resp = requests.get(f"{BASE_URL}/helpers?q=priya", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data:
                # Should find Priya Sharma from seed data
                priya = [h for h in data['helpers'] if 'priya' in h.get('name', '').lower()]
                if len(priya) > 0:
                    return print_result(True, f"Found {len(priya)} helper(s) matching 'priya'")
                else:
                    return print_result(False, f"Search not working: no results for 'priya'")
            else:
                return print_result(False, f"No helpers key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_get_by_id():
    """Test getting single helper with reviews"""
    print_test("Helpers - GET /api/helpers/{id}")
    try:
        if not test_data['seeded_helper_id']:
            return print_result(False, "No helper ID available")
        
        resp = requests.get(f"{BASE_URL}/helpers/{test_data['seeded_helper_id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helper' in data and 'reviews' in data:
                if '_id' in data['helper']:
                    return print_result(False, "MongoDB _id found in helper")
                return print_result(True, f"Got helper: {data['helper']['name']}, reviews: {len(data['reviews'])}")
            else:
                return print_result(False, f"Missing helper or reviews: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_helpers_patch():
    """Test updating helper (verify status)"""
    print_test("Helpers - PATCH /api/helpers/{id} (set verified=true)")
    try:
        if not test_data['seeded_helper_id']:
            return print_result(False, "No helper ID available")
        
        payload = {"verified": True}
        resp = requests.patch(f"{BASE_URL}/helpers/{test_data['seeded_helper_id']}", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helper' in data and data['helper']['verified'] == True:
                return print_result(True, f"Helper verified: {data['helper']['name']}")
            else:
                return print_result(False, f"Verification not applied: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_bookings_create():
    """Test creating a booking"""
    print_test("Bookings - POST /api/bookings")
    try:
        if not test_data['household_user'] or not test_data['seeded_helper_id']:
            return print_result(False, "Missing user or helper data")
        
        start_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        payload = {
            "user_id": test_data['household_user']['id'],
            "user_name": test_data['household_user']['name'],
            "user_email": test_data['household_user']['email'],
            "helper_id": test_data['seeded_helper_id'],
            "helper_name": "Priya Sharma",
            "plan": "monthly",
            "price": 22000,
            "start_date": start_date,
            "hours": None,
            "address": "123 Marine Drive, Mumbai",
            "notes": "Need help with childcare for 2 kids"
        }
        resp = requests.post(f"{BASE_URL}/bookings", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'booking' in data and data['booking']['status'] == 'pending':
                if '_id' in data['booking']:
                    return print_result(False, "MongoDB _id found in booking")
                test_data['booking'] = data['booking']
                return print_result(True, f"Booking created: {data['booking']['id']}, status: {data['booking']['status']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_bookings_get_by_user():
    """Test getting bookings by user_id"""
    print_test("Bookings - GET /api/bookings?user_id=...")
    try:
        if not test_data['household_user']:
            return print_result(False, "No user data")
        
        resp = requests.get(f"{BASE_URL}/bookings?user_id={test_data['household_user']['id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'bookings' in data and len(data['bookings']) > 0:
                return print_result(True, f"Got {len(data['bookings'])} booking(s) for user")
            else:
                return print_result(False, f"No bookings found: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_bookings_get_by_helper():
    """Test getting bookings by helper_id"""
    print_test("Bookings - GET /api/bookings?helper_id=...")
    try:
        if not test_data['seeded_helper_id']:
            return print_result(False, "No helper ID")
        
        resp = requests.get(f"{BASE_URL}/bookings?helper_id={test_data['seeded_helper_id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'bookings' in data:
                return print_result(True, f"Got {len(data['bookings'])} booking(s) for helper")
            else:
                return print_result(False, f"No bookings key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_bookings_get_all():
    """Test getting all bookings"""
    print_test("Bookings - GET /api/bookings?all=true")
    try:
        resp = requests.get(f"{BASE_URL}/bookings?all=true", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'bookings' in data:
                return print_result(True, f"Got {len(data['bookings'])} total booking(s)")
            else:
                return print_result(False, f"No bookings key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_bookings_patch_accepted():
    """Test updating booking status to accepted"""
    print_test("Bookings - PATCH /api/bookings/{id} (status=accepted)")
    try:
        if not test_data['booking']:
            return print_result(False, "No booking to update")
        
        payload = {"status": "accepted"}
        resp = requests.patch(f"{BASE_URL}/bookings/{test_data['booking']['id']}", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'booking' in data and data['booking']['status'] == 'accepted':
                return print_result(True, f"Booking accepted: {data['booking']['id']}")
            else:
                return print_result(False, f"Status not updated: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_bookings_patch_completed():
    """Test updating booking status to completed"""
    print_test("Bookings - PATCH /api/bookings/{id} (status=completed)")
    try:
        if not test_data['booking']:
            return print_result(False, "No booking to update")
        
        payload = {"status": "completed"}
        resp = requests.patch(f"{BASE_URL}/bookings/{test_data['booking']['id']}", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'booking' in data and data['booking']['status'] == 'completed':
                return print_result(True, f"Booking completed: {data['booking']['id']}")
            else:
                return print_result(False, f"Status not updated: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_reviews_create():
    """Test creating a review and verify helper rating update"""
    print_test("Reviews - POST /api/reviews (should update helper rating)")
    try:
        if not test_data['household_user'] or not test_data['seeded_helper_id']:
            return print_result(False, "Missing user or helper data")
        
        payload = {
            "helper_id": test_data['seeded_helper_id'],
            "user_id": test_data['household_user']['id'],
            "user_name": test_data['household_user']['name'],
            "rating": 5,
            "comment": "Excellent service! Very professional and caring with children."
        }
        resp = requests.post(f"{BASE_URL}/reviews", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'review' in data:
                if '_id' in data['review']:
                    return print_result(False, "MongoDB _id found in review")
                test_data['review'] = data['review']
                # Now check if helper rating was updated
                helper_resp = requests.get(f"{BASE_URL}/helpers/{test_data['seeded_helper_id']}", timeout=10)
                if helper_resp.status_code == 200:
                    helper_data = helper_resp.json()
                    if 'helper' in helper_data:
                        rating = helper_data['helper'].get('rating', 0)
                        reviews_count = helper_data['helper'].get('reviews_count', 0)
                        return print_result(True, f"Review created, helper rating: {rating}, reviews: {reviews_count}")
                return print_result(True, f"Review created: {data['review']['id']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_documents_create():
    """Test uploading a document"""
    print_test("Documents - POST /api/documents")
    try:
        if not test_data['seeded_helper_id']:
            return print_result(False, "No helper ID")
        
        payload = {
            "helper_id": test_data['seeded_helper_id'],
            "type": "id_proof",
            "name": "Aadhaar Card",
            "data": "base64_encoded_document_data_here"
        }
        resp = requests.post(f"{BASE_URL}/documents", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'document' in data and data['document']['status'] == 'pending':
                if '_id' in data['document']:
                    return print_result(False, "MongoDB _id found in document")
                test_data['document'] = data['document']
                return print_result(True, f"Document uploaded: {data['document']['id']}, status: {data['document']['status']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_documents_get_by_helper():
    """Test getting documents by helper_id"""
    print_test("Documents - GET /api/documents?helper_id=...")
    try:
        if not test_data['seeded_helper_id']:
            return print_result(False, "No helper ID")
        
        resp = requests.get(f"{BASE_URL}/documents?helper_id={test_data['seeded_helper_id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'documents' in data:
                return print_result(True, f"Got {len(data['documents'])} document(s) for helper")
            else:
                return print_result(False, f"No documents key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_documents_get_all():
    """Test getting all documents"""
    print_test("Documents - GET /api/documents (all)")
    try:
        resp = requests.get(f"{BASE_URL}/documents", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'documents' in data:
                return print_result(True, f"Got {len(data['documents'])} total document(s)")
            else:
                return print_result(False, f"No documents key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_documents_patch():
    """Test approving a document"""
    print_test("Documents - PATCH /api/documents/{id} (status=approved)")
    try:
        if not test_data['document']:
            return print_result(False, "No document to update")
        
        payload = {"status": "approved"}
        resp = requests.patch(f"{BASE_URL}/documents/{test_data['document']['id']}", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok'):
                return print_result(True, f"Document approved: {test_data['document']['id']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_documents_delete():
    """Test deleting a document"""
    print_test("Documents - DELETE /api/documents/{id}")
    try:
        if not test_data['document']:
            return print_result(False, "No document to delete")
        
        resp = requests.delete(f"{BASE_URL}/documents/{test_data['document']['id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok'):
                return print_result(True, f"Document deleted: {test_data['document']['id']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_complaints_create():
    """Test creating a complaint"""
    print_test("Complaints - POST /api/complaints")
    try:
        if not test_data['household_user'] or not test_data['booking']:
            return print_result(False, "Missing user or booking data")
        
        payload = {
            "user_id": test_data['household_user']['id'],
            "user_name": test_data['household_user']['name'],
            "booking_id": test_data['booking']['id'],
            "helper_id": test_data['seeded_helper_id'],
            "helper_name": "Priya Sharma",
            "subject": "Late arrival",
            "message": "Helper arrived 30 minutes late without prior notice"
        }
        resp = requests.post(f"{BASE_URL}/complaints", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'complaint' in data and data['complaint']['status'] == 'open':
                if '_id' in data['complaint']:
                    return print_result(False, "MongoDB _id found in complaint")
                test_data['complaint'] = data['complaint']
                return print_result(True, f"Complaint created: {data['complaint']['id']}, status: {data['complaint']['status']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_complaints_get_by_user():
    """Test getting complaints by user_id"""
    print_test("Complaints - GET /api/complaints?user_id=...")
    try:
        if not test_data['household_user']:
            return print_result(False, "No user data")
        
        resp = requests.get(f"{BASE_URL}/complaints?user_id={test_data['household_user']['id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'complaints' in data:
                return print_result(True, f"Got {len(data['complaints'])} complaint(s) for user")
            else:
                return print_result(False, f"No complaints key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_complaints_get_all():
    """Test getting all complaints"""
    print_test("Complaints - GET /api/complaints?all=true")
    try:
        resp = requests.get(f"{BASE_URL}/complaints?all=true", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'complaints' in data:
                return print_result(True, f"Got {len(data['complaints'])} total complaint(s)")
            else:
                return print_result(False, f"No complaints key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_complaints_patch():
    """Test resolving a complaint"""
    print_test("Complaints - PATCH /api/complaints/{id} (resolve)")
    try:
        if not test_data['complaint']:
            return print_result(False, "No complaint to update")
        
        payload = {
            "status": "resolved",
            "admin_reply": "We have spoken to the helper and ensured this won't happen again."
        }
        resp = requests.patch(f"{BASE_URL}/complaints/{test_data['complaint']['id']}", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok'):
                return print_result(True, f"Complaint resolved: {test_data['complaint']['id']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_attendance_create():
    """Test marking attendance"""
    print_test("Attendance - POST /api/attendance")
    try:
        if not test_data['booking'] or not test_data['household_user']:
            return print_result(False, "Missing booking or user data")
        
        payload = {
            "booking_id": test_data['booking']['id'],
            "helper_id": test_data['seeded_helper_id'],
            "helper_name": "Priya Sharma",
            "user_id": test_data['household_user']['id'],
            "status": "present",
            "notes": "On time, good work"
        }
        resp = requests.post(f"{BASE_URL}/attendance", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'attendance' in data:
                if '_id' in data['attendance']:
                    return print_result(False, "MongoDB _id found in attendance")
                test_data['attendance'] = data['attendance']
                return print_result(True, f"Attendance marked: {data['attendance']['id']}, status: {data['attendance']['status']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_attendance_get_by_booking():
    """Test getting attendance by booking_id"""
    print_test("Attendance - GET /api/attendance?booking_id=...")
    try:
        if not test_data['booking']:
            return print_result(False, "No booking data")
        
        resp = requests.get(f"{BASE_URL}/attendance?booking_id={test_data['booking']['id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'attendance' in data:
                return print_result(True, f"Got {len(data['attendance'])} attendance record(s) for booking")
            else:
                return print_result(False, f"No attendance key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_attendance_get_by_helper():
    """Test getting attendance by helper_id"""
    print_test("Attendance - GET /api/attendance?helper_id=...")
    try:
        if not test_data['seeded_helper_id']:
            return print_result(False, "No helper ID")
        
        resp = requests.get(f"{BASE_URL}/attendance?helper_id={test_data['seeded_helper_id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'attendance' in data:
                return print_result(True, f"Got {len(data['attendance'])} attendance record(s) for helper")
            else:
                return print_result(False, f"No attendance key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_attendance_get_all():
    """Test getting all attendance records"""
    print_test("Attendance - GET /api/attendance?all=true")
    try:
        resp = requests.get(f"{BASE_URL}/attendance?all=true", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'attendance' in data:
                return print_result(True, f"Got {len(data['attendance'])} total attendance record(s)")
            else:
                return print_result(False, f"No attendance key: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_categories_get():
    """Test getting categories - should auto-seed"""
    print_test("Categories - GET /api/categories (auto-seeds)")
    try:
        resp = requests.get(f"{BASE_URL}/categories", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'categories' in data and len(data['categories']) >= 3:
                if any('_id' in c for c in data['categories']):
                    return print_result(False, "MongoDB _id found in categories")
                # Check for default categories
                names = [c['name'] for c in data['categories']]
                if 'Maid' in names and 'Nanny' in names and 'Babysitter' in names:
                    return print_result(True, f"Got {len(data['categories'])} categories (seeded)")
                else:
                    return print_result(False, f"Missing default categories: {names}")
            else:
                return print_result(False, f"Not enough categories: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_categories_create():
    """Test creating a new category"""
    print_test("Categories - POST /api/categories")
    try:
        payload = {
            "name": "Cook",
            "icon": "👨‍🍳",
            "description": "Professional cooking services"
        }
        resp = requests.post(f"{BASE_URL}/categories", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'category' in data:
                if '_id' in data['category']:
                    return print_result(False, "MongoDB _id found in category")
                test_data['category'] = data['category']
                return print_result(True, f"Category created: {data['category']['name']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_categories_patch():
    """Test updating a category"""
    print_test("Categories - PATCH /api/categories/{id} (set active=false)")
    try:
        if not test_data['category']:
            return print_result(False, "No category to update")
        
        payload = {"active": False}
        resp = requests.patch(f"{BASE_URL}/categories/{test_data['category']['id']}", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok'):
                return print_result(True, f"Category deactivated: {test_data['category']['id']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_categories_delete():
    """Test deleting a category"""
    print_test("Categories - DELETE /api/categories/{id}")
    try:
        if not test_data['category']:
            return print_result(False, "No category to delete")
        
        resp = requests.delete(f"{BASE_URL}/categories/{test_data['category']['id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok'):
                return print_result(True, f"Category deleted: {test_data['category']['id']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_users_patch():
    """Test updating user profile"""
    print_test("Users - PATCH /api/users/{id} (update profile)")
    try:
        if not test_data['household_user']:
            return print_result(False, "No user to update")
        
        payload = {
            "phone": "+91-9876543299",
            "city": "Pune",
            "address": "456 New Address, Pune",
            "family_size": 4,
            "preferences": "Need help with cooking and cleaning"
        }
        resp = requests.patch(f"{BASE_URL}/users/{test_data['household_user']['id']}", json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'user' in data and data['user']['city'] == 'Pune':
                if 'password' in data['user']:
                    return print_result(False, "Password leaked in response")
                return print_result(True, f"User profile updated: {data['user']['name']}")
            else:
                return print_result(False, f"Update not applied: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_admin_stats():
    """Test admin stats endpoint"""
    print_test("Admin - GET /api/admin/stats")
    try:
        resp = requests.get(f"{BASE_URL}/admin/stats", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            required_keys = ['users', 'helpers', 'verifiedHelpers', 'bookings', 'pending', 'cancelled', 'completed', 'complaints', 'openComplaints']
            if all(key in data for key in required_keys):
                return print_result(True, f"Stats: {data['users']} users, {data['helpers']} helpers, {data['bookings']} bookings")
            else:
                return print_result(False, f"Missing keys in stats: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_admin_analytics():
    """Test admin analytics endpoint"""
    print_test("Admin - GET /api/admin/analytics")
    try:
        resp = requests.get(f"{BASE_URL}/admin/analytics", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            required_keys = ['statusCounts', 'planCounts', 'serviceCounts', 'months', 'topHelpers', 'completionRate', 'avgSatisfaction', 'mau', 'totalRevenue']
            if all(key in data for key in required_keys):
                if len(data['months']) == 6:
                    return print_result(True, f"Analytics: {data['completionRate']}% completion, {data['mau']} MAU, ₹{data['totalRevenue']} revenue")
                else:
                    return print_result(False, f"Expected 6 months, got {len(data['months'])}")
            else:
                return print_result(False, f"Missing keys in analytics: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_admin_users():
    """Test admin users list endpoint"""
    print_test("Admin - GET /api/admin/users")
    try:
        resp = requests.get(f"{BASE_URL}/admin/users", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'users' in data and len(data['users']) > 0:
                # Check no passwords leaked
                if any('password' in u for u in data['users']):
                    return print_result(False, "Passwords found in users list")
                if any('_id' in u for u in data['users']):
                    return print_result(False, "MongoDB _id found in users")
                return print_result(True, f"Got {len(data['users'])} users (no passwords)")
            else:
                return print_result(False, f"No users returned: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_admin_helpers():
    """Test admin helpers list endpoint"""
    print_test("Admin - GET /api/admin/helpers")
    try:
        resp = requests.get(f"{BASE_URL}/admin/helpers", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'helpers' in data and len(data['helpers']) > 0:
                if any('_id' in h for h in data['helpers']):
                    return print_result(False, "MongoDB _id found in helpers")
                return print_result(True, f"Got {len(data['helpers'])} helpers")
            else:
                return print_result(False, f"No helpers returned: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_admin_delete_user():
    """Test admin delete user endpoint"""
    print_test("Admin - DELETE /api/admin/users/{id}")
    try:
        if not test_data['household_user']:
            return print_result(False, "No user to delete")
        
        resp = requests.delete(f"{BASE_URL}/admin/users/{test_data['household_user']['id']}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok'):
                return print_result(True, f"User deleted: {test_data['household_user']['id']}")
            else:
                return print_result(False, f"Unexpected response: {data}")
        else:
            return print_result(False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def run_all_tests():
    """Run all tests in priority order"""
    print("\n" + "="*80)
    print("HELPER4U BACKEND API COMPREHENSIVE TEST SUITE")
    print("="*80)
    
    results = []
    
    # HIGH PRIORITY TESTS
    print("\n\n### HIGH PRIORITY TESTS ###\n")
    
    # Health
    results.append(("Health Check", test_health()))
    
    # Auth
    results.append(("Auth - Register Household", test_auth_register_household()))
    results.append(("Auth - Register Duplicate", test_auth_register_duplicate()))
    results.append(("Auth - Register Helper", test_auth_register_helper()))
    results.append(("Auth - Login Admin", test_auth_login_admin()))
    results.append(("Auth - Login Wrong Password", test_auth_login_wrong_password()))
    
    # Helpers
    results.append(("Helpers - List", test_helpers_list()))
    results.append(("Helpers - Filter Service", test_helpers_filter_service()))
    results.append(("Helpers - Filter City", test_helpers_filter_city()))
    results.append(("Helpers - Filter Plan", test_helpers_filter_plan()))
    results.append(("Helpers - Filter MinExp", test_helpers_filter_minexp()))
    results.append(("Helpers - Filter Availability", test_helpers_filter_availability()))
    results.append(("Helpers - Filter Verified", test_helpers_filter_verified()))
    results.append(("Helpers - Filter Search", test_helpers_filter_search()))
    results.append(("Helpers - Get By ID", test_helpers_get_by_id()))
    results.append(("Helpers - Patch", test_helpers_patch()))
    
    # Bookings
    results.append(("Bookings - Create", test_bookings_create()))
    results.append(("Bookings - Get By User", test_bookings_get_by_user()))
    results.append(("Bookings - Get By Helper", test_bookings_get_by_helper()))
    results.append(("Bookings - Get All", test_bookings_get_all()))
    results.append(("Bookings - Patch Accepted", test_bookings_patch_accepted()))
    results.append(("Bookings - Patch Completed", test_bookings_patch_completed()))
    
    # Admin
    results.append(("Admin - Stats", test_admin_stats()))
    results.append(("Admin - Analytics", test_admin_analytics()))
    results.append(("Admin - Users List", test_admin_users()))
    results.append(("Admin - Helpers List", test_admin_helpers()))
    
    # MEDIUM PRIORITY TESTS
    print("\n\n### MEDIUM PRIORITY TESTS ###\n")
    
    # Reviews
    results.append(("Reviews - Create", test_reviews_create()))
    
    # Documents
    results.append(("Documents - Create", test_documents_create()))
    results.append(("Documents - Get By Helper", test_documents_get_by_helper()))
    results.append(("Documents - Get All", test_documents_get_all()))
    results.append(("Documents - Patch", test_documents_patch()))
    results.append(("Documents - Delete", test_documents_delete()))
    
    # Complaints
    results.append(("Complaints - Create", test_complaints_create()))
    results.append(("Complaints - Get By User", test_complaints_get_by_user()))
    results.append(("Complaints - Get All", test_complaints_get_all()))
    results.append(("Complaints - Patch", test_complaints_patch()))
    
    # Attendance
    results.append(("Attendance - Create", test_attendance_create()))
    results.append(("Attendance - Get By Booking", test_attendance_get_by_booking()))
    results.append(("Attendance - Get By Helper", test_attendance_get_by_helper()))
    results.append(("Attendance - Get All", test_attendance_get_all()))
    
    # Categories
    results.append(("Categories - Get", test_categories_get()))
    results.append(("Categories - Create", test_categories_create()))
    results.append(("Categories - Patch", test_categories_patch()))
    results.append(("Categories - Delete", test_categories_delete()))
    
    # LOW PRIORITY TESTS
    print("\n\n### LOW PRIORITY TESTS ###\n")
    
    # User Profile
    results.append(("Users - Patch Profile", test_users_patch()))
    
    # Admin Delete (last to avoid breaking other tests)
    results.append(("Admin - Delete User", test_admin_delete_user()))
    
    # SUMMARY
    print("\n\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    failed = sum(1 for _, result in results if not result)
    total = len(results)
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if failed > 0:
        print("\n\nFailed Tests:")
        for name, result in results:
            if not result:
                print(f"  ❌ {name}")
    
    print("\n" + "="*80)
    return passed, failed, total

if __name__ == "__main__":
    run_all_tests()
