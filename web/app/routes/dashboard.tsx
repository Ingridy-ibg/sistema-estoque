import { redirect } from "react-router";
import { getToken, clearToken } from "../lib/session";

export async function clientLoader() {
  const token = getToken();
  if (!token) {
    throw redirect("/login");
  }
  return null;
}

export default function Dashboard() {
  return (
    <div>
      <h1>Painel do estoque</h1>
      <p>Login funcionou!</p>
    </div>
  );
}