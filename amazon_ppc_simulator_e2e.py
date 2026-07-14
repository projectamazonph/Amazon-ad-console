import sys
import os
from playwright.sync_api import sync_playwright, expect

def run_e2e_tests():
    print("==========================================")
    print("🚀 STARTING AMAZON PPC SIMULATOR BROWSER E2E TEST")
    print("==========================================")

    with sync_playwright() as p:
        # Launch headless Chromium browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the offline simulator HTML page
        html_path = "file:///app/amazon_ppc_simulator.html"
        print(f"🔗 Navigating to: {html_path}")
        page.goto(html_path)

        # 1. Verify Initial Simulator Render & State
        print("🔍 Step 1: Verifying Initial Simulator Dashboard Render")
        page.wait_for_selector(".topbar")
        expect(page.locator(".brand")).to_contain_text("Ads Console Training Simulator")
        expect(page.locator("[data-action='profileToggleDropdown']")).to_contain_text("Trainee 1")
        print("✅ Step 1 Passed: Initial dashboard rendered and Trainee 1 is active by default.")

        # 2. Test Dropdown Profile Switcher Quick-Create
        print("🔍 Step 2: Testing Profile Switcher Dropdown Quick-Create")
        page.click("[data-action='profileToggleDropdown']")
        page.wait_for_selector("#profileDropdownMenu", state="visible")

        # Fill name and click create
        page.fill("#newProfileNameInput", "E2E Tester")
        page.click("[data-action='profileCreate']")

        # Verify active profile updated and toast appeared
        expect(page.locator("[data-action='profileToggleDropdown']")).to_contain_text("E2E Tester")
        page.wait_for_selector(".toast.good")
        expect(page.locator(".toast.good")).to_contain_text("Created and switched to profile: E2E Tester")
        print("✅ Step 2 Passed: Quick-profile creation and switching works with instant UI updates.")

        # 3. Test Trainer Dashboard Profiles Administration Panel
        print("🔍 Step 3: Testing Trainer Dashboard Profiles Admin Panel")
        # Navigate to trainer dashboard
        page.click(".sidebar [data-view='trainer']")
        page.wait_for_selector("text=Trainee Profiles Management")

        # Verify the profiles are listed in the table
        expect(page.locator(".drill-result-table").first).to_contain_text("E2E Tester")
        expect(page.locator(".drill-result-table").first).to_contain_text("Trainee 1")

        # Create a third profile "Trainer Admin" from the admin panel input
        page.fill("#dashboardNewProfileInput", "Trainer Admin")
        page.click("[data-action='profileDashboardCreate']")

        # Verify active trainee name has updated to Trainer Admin
        expect(page.locator("[data-action='profileToggleDropdown']")).to_contain_text("Trainer Admin")

        # Go back to trainer view and verify all three profiles are present
        page.click(".sidebar [data-view='trainer']")
        page.wait_for_selector("text=Trainer Admin")
        expect(page.locator(".drill-result-table").first).to_contain_text("Trainer Admin")
        expect(page.locator(".drill-result-table").first).to_contain_text("E2E Tester")
        expect(page.locator(".drill-result-table").first).to_contain_text("Trainee 1")
        print("✅ Step 3 Passed: Trainer dashboard administration panel renders, registers, and switches profiles properly.")

        # 4. Test State Isolation between Profiles
        print("🔍 Step 4: Testing State Isolation between Profiles")
        # Change Campaign Manager search or settings in Trainer Admin profile
        page.click(".sidebar [data-view='campaigns']")
        page.fill("input[placeholder='Search campaigns, portfolio, targeting']", "Special Campaign Search Filter")

        # Switch back to E2E Tester profile using the dashboard panel
        page.click(".sidebar [data-view='trainer']")
        # Find the switch button specifically for E2E Tester profile and click it
        switch_btn = page.locator("tr", has_text="E2E Tester").locator("button[data-action='profileSwitch']")
        switch_btn.click()

        # Verify active user is back to E2E Tester
        expect(page.locator("[data-action='profileToggleDropdown']")).to_contain_text("E2E Tester")

        # Go to campaigns view and verify the search input was NOT changed (it is clean/empty)
        page.click(".sidebar [data-view='campaigns']")
        search_val = page.locator("input[placeholder='Search campaigns, portfolio, targeting']").input_value()
        assert search_val == "", f"Expected search value to be empty for E2E Tester profile, but got: '{search_val}'"
        print("✅ Step 4 Passed: States are perfectly isolated. Changes in one workspace do not corrupt others.")

        # 5. Test Wrong-Click Blocking Bypass for Profile Operations
        print("🔍 Step 5: Testing Wrong-Click Blocking Bypass during Guided Drills")
        # Start a guided drill
        page.click(".sidebar [data-view='navDrills']")
        page.wait_for_selector("text=Find and block waste from Search terms")
        # Click start drill on first card
        page.locator("[data-action='startNavDrill'][data-id='nav-sp-search-term-negative']").click()
        page.wait_for_selector(".nav-drill-card")

        # Click on the profile dropdown toggle (which is not the drill step target)
        page.click("[data-action='profileToggleDropdown']")
        # Verify dropdown opens and NO wrong-click warning toast is displayed
        page.wait_for_selector("#profileDropdownMenu", state="visible")

        warning_toast_exists = page.locator(".toast.bad").count() > 0
        assert not warning_toast_exists, "Wrong-click blocking was incorrectly triggered on a profile interaction!"

        # Close the dropdown
        page.click("[data-action='profileToggleDropdown']")

        # Stop the drill
        page.click("[data-action='stopNavDrill']")
        print("✅ Step 5 Passed: Profile operations successfully bypassed the wrong-click drill gate without penalties.")

        # 6. Test Profile Deletion
        print("🔍 Step 6: Testing Profile Deletion")
        page.click(".sidebar [data-view='trainer']")
        page.wait_for_selector("text=Trainee Profiles Management")

        # We have Trainer Admin, E2E Tester, and Trainee 1.
        # Let's delete "Trainer Admin" profile
        # Since we have custom confirm() handler, we will auto-accept dialogs
        page.on("dialog", lambda dialog: dialog.accept())

        delete_btn = page.locator("tr", has_text="Trainer Admin").locator("button[data-action='profileDelete']")
        delete_btn.click()

        # Verify "Trainer Admin" is gone from the table
        page.wait_for_timeout(500) # wait briefly for UI update
        expect(page.locator(".drill-result-table").first).not_to_contain_text("Trainer Admin")
        print("✅ Step 6 Passed: Profiles can be safely deleted and removed from index.")

        browser.close()

    print("==========================================")
    print("🎉 ALL AMAZON PPC SIMULATOR BROWSER E2E TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    try:
        run_e2e_tests()
        sys.exit(0)
    except Exception as e:
        print(f"❌ TEST RUN FAILED: {e}")
        sys.exit(1)
