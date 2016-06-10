const API_ENDPOINT = `http://localhost:3000/posts`;

export const fetchPosts = () => {
  return fetch(API_ENDPOINT).then(function (response) {
    return response.json().then(function (json) {
console.dir(json);
      // return json.photos.photo.map(
      //   ({farm, server, id, secret}) => `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`
      // );
    })
  })
};
