import requests
from config.env import SERVICE_NAME, INDEXER_NAME, AZURE_API_KEY

# TODO: mention all env vars in readme

indexer_url = f"https://{SERVICE_NAME}.search.windows.net/indexers/{INDEXER_NAME}/run?api-version=2024-07-01"
headers = {
    "api-key" :AZURE_API_KEY, # better name AZURE_SEARCH_API_KEY
    "Content-Type" : "application/json"
}
def run_index_request():
    r = requests.post(indexer_url, headers=headers)
    if r.status_code == 202:
        print("Run index request is accepted")
    else:
        print(f"Run index request not accepted. Status: {r.status_code}, Response: {r.text}")

if __name__ == "__main__":
    run_index_request()