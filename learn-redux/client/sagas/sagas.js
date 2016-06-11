import { fetchPosts } from '../data/posts.js';
import { fetchComments } from '../data/comments.js';
import { put, take } from 'redux-saga/effects';


export function* loadPosts() {
console.info('loadPosts');
  try {
    const posts = yield fetchPosts()
console.log(posts)
    yield put({type: 'POSTS_LOADED', posts})
  } catch(error) {
    yield put({type: 'POSTS_LOAD_FAILURE', error})
  }
}


export function* watchForLoadPosts() {
  while(true) {
    yield take('LOAD_POSTS');
    yield loadPosts();
  }
}


export function* loadComments() {
console.info('Comments');
  try {
    const comments = yield fetchComments()
console.log(comments)
    yield put({type: 'COMMENTS_LOADED', comments})
  } catch(error) {
    yield put({type: 'COMMENTS_LOAD_FAILURE', error})
  }
}


export function* watchForLoadComments() {
  while(true) {
    yield take('LOAD_COMMENTS');
    yield loadComments();
  }
}