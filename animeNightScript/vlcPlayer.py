import os, time
from dotenv import load_dotenv
from pathlib import Path
os.add_dll_directory(Path(os.getenv("VLCPATH")))
import vlc

ANIMEPATH = Path(os.getenv("ANIMEPATH"))

# get file names
files = os.listdir(ANIMEPATH)
animes = [show for show in files if ".torrent" not in show and ".aria2" not in show]

Instance = vlc.Instance('--fullscreen', '--mouse-hide-timeout=0')
MediaList = Instance.media_list_new()
duration = 0

for anime in animes:
  MediaList.add_media(Instance.media_new(ANIMEPATH / anime))

listPlayer = Instance.media_list_player_new()
listPlayer.set_media_list(MediaList)

listPlayer.play()
while listPlayer.is_playing:
  time.sleep(60)