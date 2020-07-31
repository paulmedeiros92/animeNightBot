import sqlite3
from sqlite3 import Error

# read from sqlite database and collect anime name and episode / season
DATABASEPATH = r"C:\Users\Abacaxi\Desktop\Bots\AnimeNightDB\AnimeNightDB.db"

def create_connection(db_file):
  conn = None
  try: 
    conn = sqlite3.connect(db_file)
  except Error as e:
    print(e)
  return conn

def select_all_shows(conn):
  cur = conn.cursor()
  cur.execute("SELECT * FROM lineup")
  return cur.fetchall()

def get_all_shows():
  print("Connecting to database...")
  conn = create_connection(DATABASEPATH)
  print("Selecting all shows..")
  return select_all_shows(conn)
