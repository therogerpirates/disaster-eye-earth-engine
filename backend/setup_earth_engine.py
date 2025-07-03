#!/usr/bin/env python3
"""
Google Earth Engine Authentication Setup
Run this script to authenticate your Earth Engine access
"""

import os
import sys

def check_earthengine_installed():
    """Check if earthengine-api is installed"""
    try:
        import ee
        print("✅ earthengine-api is installed")
        return True
    except ImportError:
        print("❌ earthengine-api is not installed")
        print("📋 Install it with: pip install earthengine-api")
        return False

def authenticate_user():
    """Authenticate user with Earth Engine"""
    try:
        import ee
        print("🔐 Starting Earth Engine authentication...")
        print("📋 This will open a browser window for authentication")
        
        # Authenticate
        ee.Authenticate()
        print("✅ Earth Engine authentication completed")
        
        # Test initialization
        ee.Initialize()
        print("✅ Earth Engine initialization successful")
        
        return True
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return False

def setup_service_account():
    """Guide user through service account setup"""
    print("\n" + "="*50)
    print("SERVICE ACCOUNT SETUP (Optional)")
    print("="*50)
    print("For production use, you can set up a service account:")
    print("1. Go to Google Cloud Console: https://console.cloud.google.com/")
    print("2. Create or select a project")
    print("3. Enable Earth Engine API")
    print("4. Create a service account")
    print("5. Download the JSON key file")
    print("6. Place the JSON file in this directory as 'service-account-key.json'")
    print("7. Update the .env file with your service account email")

def main():
    print("🌍 Google Earth Engine Setup for Disaster Eye")
    print("="*50)
    
    if not check_earthengine_installed():
        return
    
    print("\n📋 Choose authentication method:")
    print("1. User Authentication (Recommended for development)")
    print("2. Service Account Setup Info")
    print("3. Test Current Setup")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        if authenticate_user():
            print("\n✅ Setup complete! You can now run the application.")
        else:
            print("\n❌ Setup failed. Please check the error messages above.")
    
    elif choice == "2":
        setup_service_account()
    
    elif choice == "3":
        try:
            import ee
            ee.Initialize()
            print("✅ Earth Engine is properly configured!")
        except Exception as e:
            print(f"❌ Earth Engine setup issue: {e}")
            print("📋 Try running authentication first (option 1)")
    
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()
