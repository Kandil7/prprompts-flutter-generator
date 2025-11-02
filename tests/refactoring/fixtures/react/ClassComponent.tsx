import React, { Component } from 'react';

interface Props {
  userId: string;
}

interface State {
  user: any;
  isLoading: boolean;
  error: string | null;
}

class UserProfile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: null,
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchUser();
  }

  async fetchUser() {
    this.setState({ isLoading: true });
    try {
      const response = await fetch(`/api/users/${this.props.userId}`);
      const user = await response.json();
      this.setState({ user, isLoading: false });
    } catch (error) {
      this.setState({ error: 'Failed to load user', isLoading: false });
    }
  }

  handleEdit = () => {
    console.log('Edit user');
  };

  render() {
    const { user, isLoading, error } = this.state;

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    return (
      <div>
        {user && (
          <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <button onClick={this.handleEdit}>Edit</button>
          </div>
        )}
      </div>
    );
  }
}

export default UserProfile;
