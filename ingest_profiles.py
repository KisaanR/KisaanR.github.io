import os
from bs4 import BeautifulSoup
from supabase import create_client, Client

# ══ HARDCODE YOUR CREDENTIALS HERE TO BYPASS THE TERMINAL GLITCH ══
SUPABASE_URL = "https://zbhuljurcvwrhaorxusc.supabase.co"
# Make sure to swap this with your actual service_role key from your Supabase dashboard!
SUPABASE_KEY = "sb_publishable_Usk6ADOtzJNAnbDkiPll8w_pzknKhj_" 

# Initialize Supabase Admin Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ... leave the rest of the script exactly the same ...
# Initialize Supabase Admin Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_and_upload(file_path, researcher_name):
    print(f"\n[+] Processing path target: '{file_path}' for {researcher_name}...")
    
    if not os.path.exists(file_path):
        print(f"[X] Operational Error: File not found at {file_path}. Skipping.")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, "html.parser")
    rows = soup.select("tr.gsc_a_tr")
    
    print(f"[+] Found {len(rows)} raw data entries inside HTML source.")
    parsed_papers = []
    
    for row in rows:
        title_el = row.select_one(".gsc_a_at")
        if not title_el:
            continue
            
        title = title_el.text
        link = "https://scholar.google.com" + title_el["href"] if title_el.has_attr("href") else None
        
        meta_divs = row.select(".gsc_a_at+ .gs_gray")
        authors = meta_divs[0].text if len(meta_divs) > 0 else ""
        venue = meta_divs[1].text if len(meta_divs) > 1 else ""
        
        # Parse Year safely
        year_el = row.select_one(".gsc_a_y .gsc_a_h")
        try:
            year = int(year_el.text) if year_el and year_el.text.strip() else 2016
        except ValueError:
            year = 2016
            
        # Parse Citations safely
        cites_el = row.select_one(".gsc_a_c a")
        try:
            citations = int(cites_el.text) if cites_el and cites_el.text.strip().isdigit() else 0
        except ValueError:
            citations = 0
            
        # UI Threshold limit filter (2016 - present)
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
            
    if parsed_papers:
        print(f"[+] Injecting {len(parsed_papers)} filtered records into Supabase production layer...")
        try:
            supabase.table("publications").insert(parsed_papers).execute()
            print(f"[✓] Successfully populated dataset for {researcher_name}!")
        except Exception as e:
            print(f"[X] Transaction rejected by database instance: {e}")
    else:
        print("[-] No modern valid rows matching criteria (>=2016) found to upload.")

if __name__ == "__main__":
    # Define targets map (Update names if you want different display labels in your UI dropdowns)
    targets = [
        {"file": "profile1.html", "name": "Aazad Abbas"},
        {"file": "profile2.html", "name": "Robert Kocheki"}
    ]
    
    for target in targets:
        parse_and_upload(target["file"], target["name"])
        
    print("\n[✓] Global database batch injection sequence completed.")