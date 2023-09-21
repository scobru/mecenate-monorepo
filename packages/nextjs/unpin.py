import requests
import json

# Your Pinata API Key and Secret API Key
API_KEY = "e5623b637e18e5fe8836"
SECRET_API_KEY = "2d535984c3bfde9767bf765287669747e3beeafd922863d09e93052287213372"

# Base API URL for Pinata
BASE_URL = "https://api.pinata.cloud/"

# Headers
HEADERS = {
    "pinata_api_key": API_KEY,
    "pinata_secret_api_key": SECRET_API_KEY,
}


def fetch_all_pins():
    url = f"{BASE_URL}data/pinList"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        print(f"Failed to fetch pinned items: {response.json()}")
        return []
    
    return response.json()["rows"]

def unpin_and_delete_content(hash_to_unpin):
    url = f"{BASE_URL}pinning/pinByHash/{hash_to_unpin}"
    params = {'deleteWhenDone': 'true'}
    response = requests.delete(url, headers=HEADERS, params=params)
    
    if response.status_code == 200:
        print(f"Successfully unpinned and deleted {hash_to_unpin}")
    else:
        print(f"Failed to unpin and delete {hash_to_unpin}: {response.json()}")


def unpin_and_delete_content(hash_to_unpin):
    url = f"{BASE_URL}pinning/pinByHash/{hash_to_unpin}"
    params = {'deleteWhenDone': 'true'}
    response = requests.delete(url, headers=HEADERS, params=params)
    
    if response.status_code == 200:
        print(f"Successfully unpinned and deleted {hash_to_unpin}")
    else:
        print(f"Failed to unpin and delete {hash_to_unpin}: {response.json()}")



if __name__ == "__main__":
   # Fetch all pinned content
    all_pinned_content = fetch_all_pins()

    # Unpin and delete each content
    for content in all_pinned_content:
        ipfs_hash = content["ipfs_pin_hash"]
        unpin_and_delete_content(ipfs_hash)
