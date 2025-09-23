import { useAppContext } from '../context/AppContext';
import { useAuth } from './useAuth';

export function useApi() {
  const { state } = useAppContext();
  const { token } = useAuth();

  const makeApiRequest = async (method, path, body = null, authRequired = false, queryParams = {}) => {
    const url = new URL(`${state.api.baseUrl}${path}`);
    Object.keys(queryParams).forEach(key => 
      url.searchParams.append(key, queryParams[key])
    );

    const headers = {
      'Content-Type': 'application/json',
    };

    if (authRequired) {
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method: method,
      headers: headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), options);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || JSON.stringify(data, null, 2);
        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }
      return data;
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  };

  return { makeApiRequest };
}

// Default export
export default useApi;