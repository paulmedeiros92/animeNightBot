import os, re

def clean_directory(directory, exceptions):
  for file in os.listdir(directory):
    if file not in exceptions:
      os.remove(os.path.join(directory, file))

def match_path_to_title_and_episode(title, episode, filePath):
  if (re.search(f"[\D]{episode}[\D]", filePath) != None) or (episode < 10 and re.search(f"\D0{episode}\D", filePath) != None):
    return True

  return False

# showName should be the database name which needs to match the folder name
def search_for_show(directory, showName, episode):
  for fileName in os.listdir(directory / showName):
    if match_path_to_title_and_episode(showName, episode, fileName):
      return (directory / showName / fileName)

  raise LookupError(f"Episode {episode} could not be found in: {directory / showName}")

def set_batch_episodes(directory, server_path, shows):
  for batchShow in [show for show in shows if show.has_batch == 1]:
    try:
      batchShow.path = search_for_show(directory, batchShow.title, batchShow.episode)
      batchShow.server_path = (server_path / batchShow.title / batchShow.path.name)
    except LookupError as error:
      print(f"{batchShow.title} {batchShow.episode} not appended due to exception")
      print(error)
  return shows

def get_files(path, exceptions):
  return [path / show for show in os.listdir(path) if not any(exception in show for exception in exceptions)]

def match_shows_to_files(server_path, shows, files):
  for show in [show for show in shows if show.has_batch != 1]:
    for file in files:
      if match_path_to_title_and_episode(show.title, show.episode, str(file.absolute())):
        show.path = file
        show.server_path = (server_path / file.name)

    if show.path == None:
      print(f"No file match for {show.title}")

  return shows