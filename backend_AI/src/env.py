import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

# # Access environment variables
tele_api_key = os.getenv("TELE_API_KEY")
tele_id = os.getenv("ID1")
# tele_id = json.loads(os.getenv("ID1"))
# yc_tele_id = os.getenv("ID1")
print(f"type of tele id is {type(tele_id)}")
print(f"type of tele id is {type(json.loads(tele_id))}")
# debug_mode = os.getenv("DEBUG")

# print("DATABASE_URL:", database_url)
# print("DEBUG:", debug_mode)