const TOKEN_KEY = 'estoque_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string){
    localStorage.setItem(TOKEN_KEY, token );
}

export function clearToken(){
    localStorage.removeItem(TOKEN_KEY);
}

export function getPapel(): string | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.papel ?? null;
  } catch {
    return null;
  }
}

    export function getUsuarioId(): number | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}