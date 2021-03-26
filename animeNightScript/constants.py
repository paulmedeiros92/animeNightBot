import os
from dotenv import load_dotenv
load_dotenv()
from pathlib import Path


BATCH_DIRECTORY_NAME = "Batches"
ARIA_PATH = Path("./aria2/aria2c.exe")
TORRENT_PATH = Path("./torrents.txt")
DB_PATH = Path(os.getenv("DB_PATH"))
ANIME_PATH = Path(os.getenv("ANIME_PATH"))
SERVER_PATH = Path(os.getenv("SERVER_PATH"))