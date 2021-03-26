import feedparser
import fileUtility


def create_search_strings(title, season, episode):
    title = title.replace(' ', '+')
    season = str(season) if season > 9 else '0' + str(season)
    episode = str(episode) if episode > 9 else '0' + str(episode) 
    return [
        f"https://nyaa.si/?page=rss&f=0&c=1_2&q={title}+S{season}E{episode}&s=seeders&o=desc",
        f"https://nyaa.si/?page=rss&f=0&c=1_2&q={title}+{episode}&s=seeders&o=desc"
    ]

def search_nyaa(shows):
    picks = []
    print("Searching Nyaa.si")
    for show in [n for n in shows if not (n.has_batch == 1)]:
        search_strings = create_search_strings(show.title, show.season, show.episode)
        Anime = feedparser.parse(search_strings[0])
        # if we don't find anything and its the first season, try without the season
        if len(Anime.entries) == 0 and show.season == 1:
            Anime = feedparser.parse(search_strings[1])    
        # find all the entries with the episode and then download the highest seeded one don't get batches
        clean = [n for n in Anime.entries if fileUtility.match_path_to_episode(show.episode, n.title)]
        if len(clean) > 0:
            print("I pick: " + clean[0].title)
            print(clean[0])
            picks.append(clean[0])
        else:
            print(f"No search results for: {show.title}")
    return picks