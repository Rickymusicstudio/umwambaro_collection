"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AdminNotifications from "@/components/AdminNotifications"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (

  /* OFFSET BELOW MAIN NAVBAR */
  <div className="admin-offset admin-full">

    <div className="admin-wrapper">

      {/* MOBILE TOP BAR */}
      <div className="admin-mobile-top">
        <button onClick={() => setOpen(true)}>☰</button>
        <span>Admin Panel</span>
        <AdminNotifications />
      </div>

      {/* OVERLAY */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>

        <h2>Admin Panel</h2>

        <nav>
          <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </Link>

          <details>
            <summary>Products</summary>

            <div className="submenu">
              <Link href="/admin/products" onClick={() => setOpen(false)}>
                Product List
              </Link>

              <Link href="/admin/products/new" onClick={() => setOpen(false)}>
                Add Product
              </Link>
            </div>
          </details>

          <Link href="/admin/orders" onClick={() => setOpen(false)}>
            Orders
          </Link>

          <Link href="/admin/accounting" onClick={() => setOpen(false)}>
            Accounting
          </Link>

          {/* LOGOUT */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
        {children}
      </main>

<style jsx>{`

/* REMOVE ANY LEFT GAPS */
.admin-full{
  margin:0;
  padding:0;
  width:100%;
}

/* OFFSET UNDER MAIN NAVBAR */
.admin-offset{
  margin-top:60px;
}

/* WRAPPER */
.admin-wrapper{
  display:flex;
  min-height:calc(100vh - 60px);
  margin:0;
  padding:0;
}

/* SIDEBAR */
.sidebar{
  width:220px;
  background:#111;
  color:white;
  padding:20px;
  display:flex;
  flex-direction:column;
  margin:0;
}

/* Title */
.sidebar h2{
  margin-bottom:30px;
}

/* Nav */
.sidebar nav{
  display:flex;
  flex-direction:column;
  gap:15px;
  flex:1;
}

.sidebar a{
  color:white;
  text-decoration:none;
  font-size:15px;
}

.sidebar a:hover{
  color:#febd69;
}

.sidebar summary{
  cursor:pointer;
  font-size:15px;
}

.submenu{
  margin-left:15px;
  margin-top:10px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.submenu a{
  color:#ccc;
  font-size:14px;
}

/* LOGOUT */
.logout-btn{
  margin-top:auto;
  background:#222;
  border:none;
  color:white;
  padding:10px;
  border-radius:6px;
  cursor:pointer;
}

.logout-btn:hover{
  background:#e74c3c;
}

/* CONTENT */
.content{
  flex:1;
  padding:30px;
  background:#f5f5f5;
}

/* MOBILE BAR */
.admin-mobile-top{
  display:none;
}

/* OVERLAY */
.overlay{
  display:none;
}

/* MOBILE MODE */
@media(max-width:768px){

  .admin-wrapper{
    flex-direction:column;
  }

  /* TOP BAR */
  .admin-mobile-top{
    display:flex;
    position:fixed;
    top:0;
    left:0;
    right:0;
    background:#111;
    color:white;
    padding:12px 16px;
    z-index:3000;
    justify-content:space-between;
    align-items:center;
  }

  .admin-mobile-top button{
    background:none;
    border:none;
    color:white;
    font-size:22px;
  }

  /* SIDEBAR DRAWER */
  .sidebar{
    position:fixed;
    top:0;
    left:0;
    height:100vh;
    transform:translateX(-100%);
    transition:transform .3s ease;
    z-index:2500;
  }

  .sidebar.open{
    transform:translateX(0);
  }

  /* OVERLAY */
  .overlay{
    display:block;
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.5);
    z-index:2400;
  }

  /* CONTENT */
  .content{
    padding:20px;
  }

}

`}</style>

    </div>
  </div>
  )
}
