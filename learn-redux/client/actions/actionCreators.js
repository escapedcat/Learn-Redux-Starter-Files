// load posts initally
export function loadPosts() {
  return {
    type: 'LOAD_POSTS'
  }
}

// load comments initally
export function loadComments() {
  return {
    type: 'LOAD_COMMENTS'
  }
}

// increment
export function increment(index) {
  return {
    type: 'INCREMENT_LIKES',
    index
  }
}

// add comment
export function addComment(postId, author, comment) {
  return {
    type: 'ADD_COMMENT',
    postId,
    author,
    comment
  }
}

// remove comment
export function removeComment(postId, i) {
  return {
    type: 'REMOVE_COMMENT',
    i,
    postId
  }
}
