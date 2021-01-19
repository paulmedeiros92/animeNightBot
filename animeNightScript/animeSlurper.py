import os
from dotenv import load_dotenv
load_dotenv()
import feedparser
import subprocess
from pathlib import Path

from sqlite import get_all_shows
import fileUtility
from constants import BATCH_DIRECTORY_NAME

TORRENTPATH = Path(os.getenv("TORRENTPATH"))
ARIAPATH = Path(os.getenv("ARIAPATH"))
ANIMEPATH = Path(os.getenv("ANIMEPATH"))

# clean directory
fileUtility.clean_directory(ANIMEPATH, [BATCH_DIRECTORY_NAME])

shows = get_all_shows()

# search anime through the feed
picks = []
print("Searching Nyaa.si")
for show in [n for n in shows if not (n[5] == 1)]:
  title = show[1].replace(' ', '+')
  season = str(show[3]) if show[3] > 9 else '0' + str(show[3])
  episode = str(show[4]) if show[4] > 9 else '0' + str(show[4]) 
  text = f"{title}+S{season}E{episode}"
  Anime = feedparser.parse("https://nyaa.si/?page=rss&f=0&c=1_2&q=" + text + "&s=seeders&o=desc")
  if len(Anime.entries) == 0 and show[3] == 1:
    text = f"{title}+{episode}"
    Anime = feedparser.parse("https://nyaa.si/?page=rss&f=0&c=1_2&q=" + text + "&s=seeders&o=desc")    
  # find all the entries with the episode and then download the highest seeded one don't get batches
  clean = [n for n in Anime.entries if n.title.find(f"{episode}") >= 0]
  if len(clean) > 0:
    print("I pick: " + clean[0].title)
    print(clean[0])
    picks.append(clean[0])
  else:
    print(f"No search results for: {text}")


print("Writing torrents to file...")
contents = ''
for show in picks:
  contents += show.link + "\n\tdir=" + str(ANIMEPATH.absolute()) + "\n\tseed-time=1\n"

f = open(TORRENTPATH, "w+")
f.write(contents)
f.close()

subprocess.call(str(ARIAPATH.absolute()) + " -i " + str(TORRENTPATH.absolute()))
