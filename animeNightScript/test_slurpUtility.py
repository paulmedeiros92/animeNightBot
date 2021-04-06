import os, shutil
import unittest
import slurpUtility
import fileUtility
from show import Show

class TestSum(unittest.TestCase):

  def test_create_search_strings(self):
    title = "Test Title"
    self.assertEqual(slurpUtility.create_search_string(title), "https://nyaa.si/?page=rss&f=0&c=1_2&q=Test+Title&s=seeders&o=desc")

  # def test_search_nyaa(self):
  #   shows = [
  #     Show([000, "Naruto", 1, 1, 13, 0])
  #   ]
  #   self.assertEqual(slurpUtility.search_nyaa(shows), [])

  def test_match_path_to_episode_13_True(self):
    episode = 13
    filePath = "I have a 13in here that matches"
    self.assertEqual(fileUtility.match_path_to_episode(episode, filePath), True)

  def test_match_path_to_episode_13_False(self):
    episode = 13
    filePath = "I dont have a 113in here that matches 13537 413:"
    self.assertEqual(fileUtility.match_path_to_episode(episode, filePath), False)
  
  def test_match_path_to_episode_2_True(self):
    episode = 2
    filePath = "I have a02in here that matches:"
    self.assertEqual(fileUtility.match_path_to_episode(episode, filePath), True)

  def test_match_path_to_episode_2_False(self):
    episode = 2
    filePath = "I dont have a 020in here that matches 12 222:"
    self.assertEqual(fileUtility.match_path_to_episode(episode, filePath), False)

  def test_dirty_then_clean_a_directory_no_exceptions(self):
    path = os.path.join(os.getcwd(), "TEST")
    os.mkdir(path)
    f = open(path + "/testfile.txt", "w+")
    f.write("")
    f.close()
    fileUtility.clean_directory(path, [])
    self.assertEqual(len(os.listdir(path)), 0)
    os.rmdir(path)

  def test_dirty_then_clean_a_directory_with_exception(self):
    path = os.path.join(os.getcwd(), "TEST")
    os.mkdir(path)
    f = open(path + "/testfile.txt", "w+")
    f.write("")
    f.close()
    f = open(path + "/important.bat", "w+")
    f.write("")
    f.close()
    fileUtility.clean_directory(path, ["important.bat"])
    self.assertEqual(len(os.listdir(path)), 1)
    shutil.rmtree(path)


if __name__ == '__main__':
  unittest.main()