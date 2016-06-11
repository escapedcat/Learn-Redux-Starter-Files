const API_ENDPOINT = `http://localhost:3000/comments`;

export const fetchComments = () => {
console.info('fetchComments');
    return fetch(API_ENDPOINT).then( response => response.json())
};