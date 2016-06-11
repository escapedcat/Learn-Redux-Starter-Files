const API_ENDPOINT = `http://localhost:3000/posts`;

export const fetchPosts = () => {
console.info('fetchPosts');
    return fetch(API_ENDPOINT).then( response => response.json())
};
