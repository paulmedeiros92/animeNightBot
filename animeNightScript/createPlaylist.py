from lxml import etree

xmlns="http://xspf.org/ns/0/"
xmlnsVLC="http://www.videolan.org/vlc/playlist/ns/0/"
application="http://www.videolan.org/vlc/playlist/0"

def create_track(location, title, position):
  track = etree.Element('track')
  etree.SubElement(track, 'location').text = location
  etree.SubElement(track, 'title').text = title
  extension = etree.SubElement(track, 'extension')
  extension.set('application', application)
  etree.SubElement(extension, etree.QName(xmlnsVLC, 'id')).text = position
  return track

def create_extension_list(how_many):
  extension = etree.Element('extension')
  extension.set('application', application)
  for i in range(how_many):
      etree.SubElement(extension, etree.QName(xmlnsVLC, 'id')).set('tid', str(i))
  return extension


def create_playlist_file(path, str_title, shows):
  NSMAP = {None:xmlns, 'vlc':xmlnsVLC}
  playlist = etree.Element('playlist', version='1', nsmap=NSMAP)
  etree.SubElement(playlist, 'title').text = str_title
  trackList = etree.SubElement(playlist, 'trackList')
  # Add to tracks to tracklist
  for i, show in enumerate(shows):
    trackList.append(create_track(show.server_path.as_uri(), show.title + " " + str(show.episode), str(i)))

  playlist.append(create_extension_list(1))
  # Add VLC items with id
  contents = etree.tostring(playlist, xml_declaration=True, encoding='utf-8', pretty_print=True).decode('utf-8')
  f = open(path / 'playlist.xspf', 'w+')
  f.write(contents)
  f.close()
