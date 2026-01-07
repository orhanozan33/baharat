import { redirect } from 'next/navigation'

export default function AdminPage() {
  // /admin erişildiğinde direkt dashboard'a yönlendir
  redirect('/admin/dashboard')
}

