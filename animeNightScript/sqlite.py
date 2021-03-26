import sys, os, sqlite3
from sqlite3 import Error
import constants
from pathlib import Path
from show import Show

# read from sqlite database and collect anime name and episode / season
def create_connection(db_file):
  if db_file.exists():
    conn = None
    try:
      conn = sqlite3.connect(db_file)
    except Error as e:
      print(f"Failed to connect: {e}")
    return conn
  else:
    print("Database does not exist")
    sys.exit()

def select_all_shows(conn):
  cur = conn.cursor()
  cur.execute("SELECT * FROM lineup")
  return cur.fetchall()

def get_all_shows():
  print("Connecting to database...")
  conn = create_connection(constants.DB_PATH)
  print("Successfully connected.")
  print("Selecting all shows..")
  rows = select_all_shows(conn)
  return [Show(n) for n in rows ]
