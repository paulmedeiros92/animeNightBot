import feedparser
import fileUtility


def create_search_string(title):
    title = title.replace(' ', '+')
    return f"https://nyaa.si/?page=rss&f=0&c=1_2&q={title}&s=seeders&o=desc"

def search_nyaa(shows):
    picks = []
    print("Searching Nyaa.si")
    for show in [n for n in shows if not (n.has_batch == 1)]:
        search_string = create_search_string(show.title)
        Anime = feedparser.parse(search_string)
        # find all the entries with the episode and then download the highest seeded one don't get batches
        clean = [n for n in Anime.entries if fileUtility.match_path_to_episode(show.episode, n.title)]
        if len(clean) > 0:
            print("I pick: " + clean[0].title)
            print(clean[0])
            picks.append(clean[0])
        else:
            print(f"No search results for: {show.title}")
    return picks