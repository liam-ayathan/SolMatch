const API_URL = process.env.API_URL;

export async function createUser(email: string) {
  const headers = { 'Content-Type': 'application/json' };

  // if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
  //   headers[
  //     'Authorization'
  //   ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  // }

  try {
    const res = await fetch(`/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        isKyc: false,
        uen: '', // You might want to pass a meaningful value here
        name: '', // You might want to pass a meaningful value here
        category: '', // You might want to pass a meaningful value here
      }),
    });

    if (!res.ok) {
      throw new Error('Network response was not ok: ' + res.statusText);
    }

    const responseData = await res.json();
    console.log('User created:', responseData);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

export async function getUser(email: string) {
  const headers = { 'Content-Type': 'application/json' };

  // if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
  //   headers['Authorization'] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  // }

  try {
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error('Network response was not ok: ' + res.statusText);
    }

    const responseData = await res.json();
    console.log('User fetched:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

export async function kycUser(
  email: string,
  uen: string,
  name: string,
  category: string
) {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        email,
        isKyc: true,
        uen,
        name,
        category,
      }),
    });
    console.log('Response from backend', res);

    if (!res.ok) {
      throw new Error('Network response was not ok: ' + res.statusText);
    }

    const responseData = await res.json();
    console.log('User KYC updated:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error updating user KYC:', error);
  }
}
