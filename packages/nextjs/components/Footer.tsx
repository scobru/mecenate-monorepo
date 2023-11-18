import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '~~/services/store/store';
import { HeartIcon } from '@heroicons/react/24/outline';
import SwitchTheme from './SwitchTheme';
import { Faucet } from '~~/components/scaffold-eth';
import { getTargetNetwork } from '~~/utils/scaffold-eth';
import { hardhat } from 'wagmi/chains';

/**
 * Site footer
 */
export default function Footer() {
  const ethPrice = useAppStore(state => state.ethPrice);
  const configuredNetwork = getTargetNetwork();

  return (
    <div className="min-h-0 p-5 mb-11 lg:mb-0 bg-gradient-to-bl from-blue-950 to-slate-950 ">
      <div>
        {/* <div className="fixed flex justify-between items-center w-full z-20 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            {ethPrice > 0 && (
              <div className="btn btn-primary btn-sm font-normal cursor-auto">
                <CurrencyDollarIcon className="h-4 w-4 mr-0.5" /> <span>{ethPrice}</span>
              </div>
            )}
            {configuredNetwork.id === hardhat.id && <Faucet />}
          </div>
          <SwitchTheme className="pointer-events-auto" />
        </div> */}
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            {/* <div>
              <a
                href="https://github.com/scaffold-eth/se-2"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Fork me
              </a>
            </div> */}
            <span>·</span>
            <div>
              Built with <HeartIcon className="inline-block h-4 w-4" /> from{' '}
              <a
                href="https://github.com/scobru"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Scobru
              </a>{' '}
              from 🏰{' '}
              <a
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                BuidlGuidl
              </a>{' '}
              and{' '}
              <a
                href="https://backdrop.so/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Backdrop
              </a>{' '}
              <a
                href="https://github.com/scobru/mecenate-monorepo"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Source Code
              </a>
            </div>
            <span>·</span>
            <div>
              <a
                href="https://t.me/+yWNEe13B5pcyNDBk"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Support
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
}
