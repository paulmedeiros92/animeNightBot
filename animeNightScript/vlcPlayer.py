import os, time
os.add_dll_directory(r"C:\Program Files\VideoLAN\VLC")
import vlc

ANIME_PATH=r"C:\Users\Abacaxi\Desktop\anime\\"

# get file names
files = os.listdir(ANIME_PATH)
animes = [show for show in files if ".torrent" not in show and ".aria2" not in show]

Instance = vlc.Instance('--fullscreen', '--mouse-hide-timeout=0')
MediaList = Instance.media_list_new()
duration = 0

for anime in animes:
  MediaList.add_media(Instance.media_new(ANIME_PATH + anime))

listPlayer = Instance.media_list_player_new()
listPlayer.set_media_list(MediaList)

listPlayer.play()
while listPlayer.is_playing:
  time.sleep(60)