import os, time
from dotenv import load_dotenv
load_dotenv()
from pathlib import Path
from sqlite import get_all_shows
from fileUtility import set_batch_episodes, get_files, match_shows_to_files
from constants import BATCH_DIRECTORY_NAME
from show import Show
from createPlaylist import create_playlist_file

ANIMEPATH = Path(os.getenv("ANIMEPATH"))

shows = [Show(show) for show in get_all_shows()]
shows = set_batch_episodes(ANIMEPATH / BATCH_DIRECTORY_NAME, shows)
files = get_files(ANIMEPATH, [BATCH_DIRECTORY_NAME, ".torrent", ".aria2"])
shows = match_shows_to_files(shows, files)

if len([show for show in shows if show.path == None]) > 0:
  print('FAILED TO FIND ALL SHOW FILES...SHUTTING DOWN!')
  quit()
shows.sort(key=lambda show: show.position)

create_playlist_file(ANIMEPATH, "Anime Night", shows)
