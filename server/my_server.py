from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()
URL = os.getenv("db_url")
APITOKEN = os.getenv("db_api_key")

url: str = URL
key: str = APITOKEN


supabase: Client = create_client(url, key)

# Function to send a GET request
def get_data(table_name: str):
    response = supabase.table(table_name).select("*").execute()
    if response.status_code == 200:
        return response.data
    else:
        return response.error

# Function to send a POST request
def insert_data(table_name: str, data: dict):
    response = supabase.table(table_name).insert(data).execute()
    if response.status_code == 201:
        return response.data
    else:
        return response.error

# Example usage
if __name__ == "__main__":
    # GET request example
    table_name = "your_table_name"
    data = get_data(table_name)
    print(data)

    # POST request example
    new_data = {"column1": "value1", "column2": "value2"}
    result = insert_data(table_name, new_data)
    print(result)