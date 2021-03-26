import subprocess
from sqlite import get_all_shows
import fileUtility
import slurpUtility
import constants

# clean directory
fileUtility.clean_directory(constants.ANIME_PATH, [constants.BATCH_DIRECTORY_NAME])

shows = get_all_shows()
# search anime through the feed
picks = slurpUtility.search_nyaa(shows)

print("Writing torrents to file...")
contents = ''
for show in picks:
  contents += show.link + "\n\tdir=" + str(constants.ANIME_PATH.absolute()) + "\n\tseed-time=1\n"

f = open(constants.TORRENT_PATH, "w+")
f.write(contents)
f.close()

subprocess.call(str(constants.ARIA_PATH.absolute()) + " -i " + str(constants.TORRENT_PATH.absolute()))
