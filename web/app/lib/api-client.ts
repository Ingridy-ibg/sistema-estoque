import { getToken, clearToken } from './session';

// Definida em tempo de build pelo Vite (.env / .env.production).
// Em desenvolvimento cai no localhost; num build de produção sem a variável,
// falha na hora em vez de tentar chamar o localhost de quem acessa.
const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

if (!API_URL) {
    throw new Error('VITE_API_URL não definida no build do front.');
}

export async function apiFetch(path: string, options: RequestInit = {}){
    const token = getToken();
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if(token){
        headers.set('Authorization', `Bearer ${token}`);
    }


const response = await fetch(`${API_URL}${path}`, {...options, headers });

if (!response.ok) {
    // Token expirado ou inválido: a sessão não serve mais, então limpa e manda
    // para o login em vez de deixar a mensagem da API parada na tela.
    // Só vale quando havia token — no login, 401 é credencial errada.
    if (response.status === 401 && token && path !== '/auth/login') {
        clearToken();
        window.location.href = '/login';
        throw new Error('Sua sessão expirou. Entre novamente.');
    }

    const erro = await response.json().catch(() => ({message: 'Erro Desconhecido'}));
    throw new Error(erro.message ?? `Erro ${response.status}`);
}

return response.json();

}