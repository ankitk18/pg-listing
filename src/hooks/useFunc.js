export const getUserByUserId = async (userId) => {
  try {
    const response = await fetch(`/api/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const getUserIdByPgId = async (pgId) => {
  try {
    const response = await fetch(`/api/pg/${pgId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user ID: ${response.status}`);
    }

    const data = await response.json();
    const user = await getUserByUserId(data.pg.userId);
    return user;
  } catch (error) {
    console.error('Error fetching user ID by PG ID:', error);
    throw error;
  }
} 