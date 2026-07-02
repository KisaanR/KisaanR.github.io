import os
import time
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# 1. Establish Database Connection Architecture
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[X] Execution Halted: Missing SUPABASE_URL or SUPABASE_KEY environment variables.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_scholar_profile(user_id, researcher_name):
    """
    Scrapes all publications from a specific Google Scholar user ID.

    Scholar ignores pagesize > 20 for anonymous (non-cookie) requests and
    always caps a single response at 20 rows, regardless of the pagesize
    param. The rest lives behind the "Show more" button, which is really
    just the same endpoint called again with cstart advanced by 20. So we
    page through with cstart until a request comes back with no rows.
    """
    print(f"[+] Scraping profile for {researcher_name} (ID: {user_id})...")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    parsed_papers = []
    cstart = 0
    page_size = 20

    try:
        while True:
            url = f"https://scholar.google.com/citations?user={user_id}&hl=en&cstart={cstart}&pagesize={page_size}"
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                print(f"[X] HTTP Error {response.status_code}: Failed to reach Google Scholar.")
                break

            soup = BeautifulSoup(response.text, "html.parser")
            rows = soup.select("tr.gsc_a_tr")
            if not rows:
                break

            for row in rows:
                title_el = row.select_one(".gsc_a_at")
                if not title_el:
                    continue

                title = title_el.text
                # Construct standard full scholar link path
                link = "https://scholar.google.com" + title_el["href"] if title_el.has_attr("href") else None

                # Sub-metadata container elements
                meta_divs = row.select(".gsc_a_at+ .gs_gray")
                authors = meta_divs[0].text if len(meta_divs) > 0 else ""
                venue = meta_divs[1].text if len(meta_divs) > 1 else ""

                # Numeric values structural extraction
                year_el = row.select_one(".gsc_a_y .gsc_a_h")
                try:
                    year = int(year_el.text) if year_el and year_el.text.strip() else 2016
                except ValueError:
                    year = 2016

                cites_el = row.select_one(".gsc_a_c a")
                try:
                    citations = int(cites_el.text) if cites_el and cites_el.text.strip().isdigit() else 0
                except ValueError:
                    citations = 0

                # Global boundary rule application (only ingest 2016 to present)
                if year >= 2016:
                    parsed_papers.append({
                        "title": title,
                        "authors": authors,
                        "venue": venue,
                        "year": year,
                        "citations": citations,
                        "researcher": researcher_name,
                        "scholar_url": link
                    })

            print(f"    ...page at cstart={cstart} returned {len(rows)} rows (running total: {len(parsed_papers)})")

            if len(rows) < page_size:
                # Short page means we've hit the end of the list
                break

            cstart += page_size
            time.sleep(1.5)  # be polite, avoid tripping Scholar's rate limiting

        return parsed_papers

    except Exception as e:
        print(f"[X] Scraper breakdown during parsing: {e}")
        return parsed_papers

def upload_to_database(payload):
    if not payload:
        print("[-] Pipeline payload contains zero target entries. Execution skipped.")
        return
        
    print(f"[+] Launching secure API batch upload: Sending {len(payload)} rows...")
    try:
        # Pushes elements in a single transactional network block
        result = supabase.table("publications").insert(payload).execute()
        print("[✓] Success! Remote tables fully populated and synced to live UI framework.")
    except Exception as e:
        print(f"[X] Database rejected payload block: {e}")

if __name__ == "__main__":
    # Example Parameters (Swap with your targets as necessary)
    TARGET_SCHOLAR_ID = "4v4AAAAJ"  # Example open public identifier profile
    TARGET_NAME = "Dr. John Doe"   # Associate target label
    
    # Run pipeline
    scraped_data = scrape_scholar_profile(TARGET_SCHOLAR_ID, TARGET_NAME)
    upload_to_database(scraped_data)