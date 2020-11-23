import os, time
from dotenv import load_dotenv
load_dotenv()
from pathlib import Path
os.add_dll_directory(Path(os.getenv("VLCPATH")))
import vlc
from sqlite import get_all_shows
from fileUtility import set_batch_episodes, get_files, match_shows_to_files
from constants import BATCH_DIRECTORY_NAME
from show import Show

ANIMEPATH = Path(os.getenv("ANIMEPATH"))

shows = [Show(show) for show in get_all_shows()]
shows = set_batch_episodes(ANIMEPATH / BATCH_DIRECTORY_NAME, shows)
files = get_files(ANIMEPATH, [BATCH_DIRECTORY_NAME, ".torrent", ".aria2"])
shows = match_shows_to_files(shows, files)

shows.sort(key=lambda show: show.position)

Instance = vlc.Instance()
MediaList = Instance.media_list_new()
duration = 0

for show in shows:
  MediaList.add_media(Instance.media_new(show.path))

listPlayer = Instance.media_list_player_new()
mediaPlayer = listPlayer.get_media_player()
mediaPlayer.video_set_mouse_input(True)
mediaPlayer.toggle_fullscreen()
listPlayer.set_media_list(MediaList)

listPlayer.play()
while listPlayer.is_playing:
  time.sleep(60)