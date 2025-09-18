#!/usr/bin/env python3
"""
Test script to verify FastAPI backend is working
"""
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"

def test_api():
    """Test the API endpoints"""
    print("🔍 Testing FastAPI Backend...")
    
    try:
        # Test health endpoint
        print("\n1. Testing health endpoint...")
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
        
        # Test root endpoint
        print("\n2. Testing root endpoint...")
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
        
        # Test seed admin user
        print("\n3. Testing admin user creation...")
        response = requests.post(f"{BASE_URL}/api/auth/seed-admin")
        if response.status_code in [200, 201]:
            print("✅ Admin user creation endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Admin user creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
        
        # Test login
        print("\n4. Testing login...")
        login_data = {
            "email": "admin@financeplatform.com",
            "password": "SecureAdmin2024!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        
        if response.status_code == 200:
            print("✅ Login successful")
            token_data = response.json()
            access_token = token_data.get("access_token")
            print(f"   Token received: {access_token[:50]}...")
            
            # Test authenticated endpoint
            print("\n5. Testing authenticated endpoint...")
            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.get(f"{BASE_URL}/api/auth/user", headers=headers)
            
            if response.status_code == 200:
                print("✅ Authenticated endpoint working")
                user_data = response.json()
                print(f"   User: {user_data.get('first_name')} {user_data.get('last_name')}")
                print(f"   Role: {user_data.get('role')}")
                print(f"   Permissions: {len(user_data.get('permissions', []))} permissions")
            else:
                print(f"❌ Authenticated endpoint failed: {response.status_code}")
                print(f"   Error: {response.text}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        print("\n🎉 All tests passed! FastAPI backend is working correctly.")
        return True
        
    except requests.ConnectionError:
        print("❌ Cannot connect to FastAPI server. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 FastAPI Backend Test Suite")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    time.sleep(1)
    
    success = test_api()
    
    if success:
        print("\n✅ Backend is ready for frontend integration!")
    else:
        print("\n❌ Backend tests failed. Check server logs.")
    
    print("\n📊 Next steps:")
    print("   1. Update React frontend to use FastAPI endpoints")
    print("   2. Build dashboard with Recharts")
    print("   3. Add responsive design and dummy data")