import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  ArrowLeftOnRectangleIcon,
  ArrowsRightLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import {
  TAutoConnect,
  useAutoConnect,
  useNetworkColor,
} from '~~/hooks/scaffold-eth';
import Balance from '~~/components/scaffold-eth/Balance';
import { BlockieAvatar } from '~~/components/scaffold-eth';
import { getTargetNetwork } from '~~/utils/scaffold-eth';
import { useDisconnect, useSwitchNetwork } from 'wagmi';

// todo: move this later scaffold config.  See TAutoConnect for comments on each prop
const tempAutoConnectConfig: TAutoConnect = {
  enableBurnerWallet: true,
  autoConnect: true,
};

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export default function RainbowKitCustomConnectButton() {
  useAutoConnect(tempAutoConnectConfig);

  const configuredChain = getTargetNetwork();
  const networkColor = useNetworkColor();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        openChainModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== configuredChain.id) {
                return (
                  <div className="dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      className="btn btn-error btn-sm dropdown-toggle"
                    >
                      <span>Wrong network</span>
                      <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                    </button>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 mt-1 shadow-lg bg-base-100 rounded-box"
                    >
                      <li>
                        <button
                          className="menu-item"
                          type="button"
                          onClick={() => switchNetwork?.(configuredChain.id)}
                        >
                          <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
                          <span className="whitespace-nowrap">
                            Switch to{' '}
                            <span style={{ color: networkColor }}>
                              {configuredChain.name}
                            </span>
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          className="menu-item text-error"
                          type="button"
                          onClick={() => disconnect()}
                        >
                          <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />{' '}
                          <span>Disconnect</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                );
              }

              return (
                <div className="px-2 flex justify-end items-center">
                  <div className="flex justify-center items-center border-1 rounded-lg">
                    <div className="flex flex-col items-center">
                      <Balance
                        address={account.address}
                        className="min-h-0 h-auto"
                      />
                      <span className="text-xs" style={{ color: networkColor }}>
                        {chain.name}
                      </span>
                    </div>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="btn btn-primary btn-sm pl-2 shadow-md"
                    >
                      <BlockieAvatar
                        address={account.address}
                        size={24}
                        ensImage={account.ensAvatar}
                      />
                      <span className="m-1">{account.displayName}</span>
                      <span>
                        <ChevronDownIcon className="h-6 w-4" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
