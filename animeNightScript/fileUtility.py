import os, re

def clean_directory(directory, exceptions):
  for file in os.listdir(directory):
    if file not in exceptions:
      os.remove(os.path.join(directory, file))

# showName should be the database name which needs to match the folder name
def search_for_show(directory, showName, episode):
  for show in os.listdir(directory / showName):
    if re.search(f"\D{episode}\D", show) != None or (episode < 10 and re.search(f"\D0{episode}\D", show) != None):
      return directory / showName / show
  print(f"Episode {episode} could not be found in: {directory / showName / show}")
  raise LookupError(f"Episode {episode} could not be found in: {directory / showName / show}")

def set_batch_episodes(directory, shows):
  for batchShow in [show for show in shows if show.has_batch == 1]:
    # get this weeks files from batch folders
    try:
      batchShow.path = search_for_show(directory, batchShow.title, batchShow.episode)
    except Exception as error:
      print(f"{batchShow[1]} not appended due to exception")
      print(error)
  return shows

def get_files(path, exceptions):
  return [path / show for show in os.listdir(path) if not any(exception in show for exception in exceptions)]

def match_shows_to_files(shows, files):
  for show in [show for show in shows if show.has_batch != 1]:
    for file in files:
      if show.title in str(file.absolute()): 
        show.path = file
    if show.path == None:
      print(f"No file match for {show.title}")
  return shows