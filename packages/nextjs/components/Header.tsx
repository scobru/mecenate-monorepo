import Link from "next/link";
import Image from "next/image";
import { FaucetButton, VerifiedBadge } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { Bars3Icon, BugAntIcon, DocumentIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import React, { useState, useRef, useCallback, useEffect } from "react";

import {
  QuestionMarkCircleIcon,
  LockClosedIcon,
  TicketIcon,
  UserIcon,
  Square3Stack3DIcon,
  MegaphoneIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { InboxIcon } from "@heroicons/react/20/solid";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      passHref
      className={`${
        isActive ? "bg-secondary shadow-md" : ""
      } hover:bg-secondary hover:shadow-md focus:bg-secondary py-2 px-3 text-sm rounded-full gap-2`}
    >
      {children}
    </Link>
  );
};

let storage;

if (typeof window !== "undefined") {
  storage = window.localStorage;
}

/**
 * Site header
 */
export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const [isLocalStorage, setIsLocalStorage] = useState(false);
  const [verified, setVerified] = useState("");
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  useEffect(() => {
    const verified = localStorage.getItem("verified");
    if (verified == "verified") {
      setIsLocalStorage(true);
      setVerified(String(verified));
    }
  }, []);

  const navLinks = (
    <>
      <li className="font-semibold">
        <NavLink href="/">
          {" "}
          <HomeIcon className="h-4 w-4" />
        </NavLink>
      </li>
      {/* <li>
        <NavLink href="/debug">
          <BugAntIcon className="h-4 w-4" />
          Debug Contracts
        </NavLink>
      </li>
      <li>
        <NavLink href="/example-ui">
          <SparklesIcon className="h-4 w-4" />
          Example UI
        </NavLink>
      </li> */}
      <li className="font-semibold">
        <NavLink href="/identity">
          <UserIcon className="h-4 w-4" />
          Identity
        </NavLink>
      </li>
      <li className="font-semibold">
        <NavLink href="/bay">
          <MegaphoneIcon className="h-4 w-4" />
          Bay
        </NavLink>
      </li>
      <li className="font-semibold">
        <NavLink href="/feeds">
          <Square3Stack3DIcon className="h-4 w-4" />
          Feeds
        </NavLink>
      </li>
      <li className="font-semibold">
        <NavLink href="/">
          <KeyIcon className="h-4 w-4" />
          Vault (coming soon)
        </NavLink>
      </li>
      <li className="font-semibold">
        <NavLink href="/messenger">
          <InboxIcon className="h-4 w-4" />
          Messenger
        </NavLink>
      </li>
      <li className="font-semibold">
        <NavLink href="https://scobru.gitbook.io/mecenatedocs/">
          <DocumentIcon className="h-4 w-4" />
          Docs
        </NavLink>
      </li>
    </>
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-primary min-h-0 flex-shrink-0 justify-between z-20 shadow-md lg:shadow-none shadow-secondary">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <button
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </button>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              {navLinks}

              <div>
                <VerifiedBadge verified={String(verified)} />
              </div>
            </ul>
          )}
        </div>
        <div className="hidden lg:flex items-left gap-2 mx-4 min-w-fit">
          {/* <Link href="/" passHref className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </Link> */}
          <div className="flex flex-col py-2">
            <span className="font-bold  text-4xl"> ℳ</span>
          </div>
        </div>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">{navLinks}</ul>{" "}
        {verified == "verified" ? <VerifiedBadge verified={String(verified)} /> : null}
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
}
