const axios = require('axios');

exports.getAnimeInfo = (showTitle) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const query = `query ($showTitle: String) {
    Media(search: $showTitle, type: ANIME) {
      title {
        english
        romaji
      },
      description,
      coverImage {
        extraLarge
        large
        medium
        color
      },
      bannerImage,
      episodes,
      trailer {
        id
        site
      },
      siteUrl
    }
  }`;
  const body = JSON.stringify({
    query,
    variables: { showTitle },
  });
  return axios.post('https://graphql.anilist.co', body, { headers });
};
