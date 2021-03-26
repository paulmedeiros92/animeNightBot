class Show:
  path = None
  server_path = None
  def __init__(self, list):
    self.title = list[1]
    self.position = list[2]
    self.season = list[3]
    self.episode = list[4]
    self.has_batch = list[5]