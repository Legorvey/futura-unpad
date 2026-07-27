/* eslint-disable */
"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useAuth } from "@/components/auth-provider";
import ConfirmDialog from "@/components/confirm-dialog";
import { LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type NavbarItem = {
  name: string;
  link: string;
};

export function NavbarDemo() {
  const { user, adminAccess, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const navItems: NavbarItem[] = [
    {
      name: "Beranda",
      link: "/",
    },
    {
      name: "Tentang",
      link: "/#about",
    },
    {
      name: "Jadwal",
      link: "/#timeline",
    },
    {
      name: "Pendaftaran",
      link: "/#registrations",
    },
    {
      name: "FAQ",
      link: "/#faq",
    },
  ];
 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
      setIsLoggingOut(true)
      const { error } = await signOut()

      if (error) {
          console.error(error)
          toast.error("Gagal keluar", { description: "Silakan coba lagi." })
          setIsLoggingOut(false)
          return
      }
      setIsLoggingOut(false)
      setLogoutOpen(false)
      toast.success("Berhasil keluar")
  }
 
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  const profileHref = adminAccess ? "/admin" : "/profile";

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {isLoading ? (
              <>
                <div className="h-10 w-[72px] animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-[84px] animate-pulse rounded-md bg-muted" />
              </>
            ) : user ? (
              <>
                <NavbarButton
                  href={profileHref}
                  variant="secondary"
                  className="flex h-10 w-10 items-center justify-center rounded-full px-0 py-0"
                  aria-label="Buka dasbor"
                >
                  <User className="h-5 w-5" />
                </NavbarButton>
                <NavbarButton
                  onClick={() => setLogoutOpen(true)}
                  variant="secondary"
                  className="flex h-10 w-10 items-center justify-center rounded-full px-0 py-0 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border"
                  aria-label="Keluar"
                >
                  <LogOut className="h-5 w-5" />
                </NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton href="/login" variant="secondary">Masuk</NavbarButton>
                <NavbarButton href="/register" variant="primary">Daftar</NavbarButton>
              </>
            )}
          </div>
        </NavBody>
 
        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
 
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              {isLoading ? (
                <>
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                </>
              ) : user ? (
                <div className="flex items-center gap-4">
                  <NavbarButton
                    href={profileHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="flex flex-1 h-10 items-center justify-center rounded-md px-4 py-2"
                    aria-label="Buka dasbor"
                  >
                    <User className="h-5 w-5 mr-2" /> Dasbor
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setLogoutOpen(true)
                    }}
                    variant="secondary"
                    className="flex h-10 items-center justify-center rounded-md px-4 py-2 text-destructive border-border"
                    aria-label="Keluar"
                  >
                    <LogOut className="h-5 w-5" />
                  </NavbarButton>
                </div>
              ) : (
                <>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    href="/login"
                    variant="primary"
                    className="w-full"
                  >
                    Masuk
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    href="/register"
                    className="w-full"
                  >
                    Daftar
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
 
      {/* Navbar Logout Confirm */}
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={"Keluar akun?"}
        description={"Anda harus masuk kembali untuk mengakses akun Futura Anda."}
        confirmText="Keluar"
        cancelText="Batal"
        variant="destructive"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
      />
    </div>
  );
}
 
