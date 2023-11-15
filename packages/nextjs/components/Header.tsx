import Link from "next/link";
import { FaucetButton } from "~~/components/scaffold-eth";
import { WalletBadge } from "~~/components/scaffold-eth";
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
import { ArchiveBoxIcon, InboxIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { FaDollarSign, FaRegTimesCircle } from "react-icons/fa";
import { ClockIcon } from "@heroicons/react/24/solid";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      passHref
      className={`${isActive ? "bg-secondary shadow-md" : ""
        } hover:bg-secondary hover:shadow-md focus:bg-secondary py-2 px-3 text-sm font-heading rounded-full gap-2`}
    >
      {children}
    </Link>
  );
};

/**
 * Site header
 */
export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const navLinks = (
    <>
      <li>
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
      */}
      <li>
        <NavLink href="/connect">
          <KeyIcon className="h-4 w-4" />
          Connect
        </NavLink>
      </li>
      <li>
        <NavLink href="/identity">
          <UserIcon className="h-4 w-4" />
          Identity
        </NavLink>
      </li>
      <li>
        <NavLink href="/bay">
          <MegaphoneIcon className="h-4 w-4" />
          Bay
        </NavLink>
      </li>
      <li>
        <NavLink href="/pay">
          <FaDollarSign className="h-4 w-4" />
          Pay
        </NavLink>
      </li>
      <li>
        <NavLink href="/feeds">
          <Square3Stack3DIcon className="h-4 w-4" />
          Feeds
        </NavLink>
      </li>
      <li>
        <NavLink href="/attestations">
          <ArchiveBoxIcon className="h-4 w-4" />
          Attestations
        </NavLink>
      </li>
      <li>
        <NavLink href="/timestamps">
          <ClockIcon className="h-4 w-4" />
          Timestamps
        </NavLink>
      </li>
      <li>
        <NavLink href="https://scobru.gitbook.io/mecenatedocs/">
          <DocumentIcon className="h-4 w-4" />
          Docs
        </NavLink>
      </li>
    </>
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-gradient-to-bl from-blue-950 to-slate-950 min-h-0 flex-shrink-0 justify-between z-20 ">
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
      </div>

      <div className="navbar-end flex-grow mr-4">
        <WalletBadge />
        {/*  <RainbowKitCustomConnectButton /> */}
        {/* <FaucetButton /> */}
      </div>
    </div>
  );
}
