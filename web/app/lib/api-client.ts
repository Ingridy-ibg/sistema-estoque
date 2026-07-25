import { getToken } from './session';

const API_URL = 'http://localhost:3000';

export async function apiFetch(path: string, options: RequestInit = {}){
    const token = getToken();
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if(token){
        headers.set('Authorization', `Bearer ${token}`);
    }


const response = await fetch(`${API_URL}${path}`, {...options, headers });

if (!response.ok) {
    const erro = await response.json().catch(() => ({message: 'Erro Desconhecido'}));
    throw new Error(erro.message ?? `Erro ${response.status}`);
}

return response.json();

}