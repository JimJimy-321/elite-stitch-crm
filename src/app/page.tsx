import { redirect } from 'next/navigation';

export default function Home() {
  console.log("SastrePro SaaS V2.0 Loaded");
  redirect('/login');
}
