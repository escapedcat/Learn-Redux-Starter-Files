import React from 'react';
import { Link } from 'react-router';

const Main = React.createClass({
  componentDidMount() {
    this.props.loadPosts();
    this.props.loadComments();
  },

  render() {
    return (
      <div>
        <h1>
          <Link to="/">Reduxstagram</Link>
        </h1>
        {React.cloneElement(this.props.children, this.props)}
      </div>
    )
  }
});

export default Main;
