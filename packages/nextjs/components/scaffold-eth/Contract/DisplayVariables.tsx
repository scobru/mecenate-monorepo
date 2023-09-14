import { FunctionFragment } from "ethers/lib/utils";
import React, { useEffect } from "react";
import { useContractRead } from "wagmi";
import { displayTxResult } from "./utilsDisplay";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { useAnimationConfig } from "~~/hooks/scaffold-eth/useAnimationConfig";

type TDisplayVariableProps = {
  functionFragment: FunctionFragment;
  contractAddress: string;
  refreshDisplayVariables: boolean;
};

const DisplayVariable = ({ contractAddress, functionFragment, refreshDisplayVariables }: TDisplayVariableProps) => {
  const configuredChain = getTargetNetwork();
  const {
    data: result,
    isFetching,
    refetch,
  } = useContractRead({
    chainId: configuredChain.id,
    address: contractAddress,
    abi: [functionFragment],
    functionName: functionFragment.name,
    args: [],
    onError: error => {
      notification.error(error.message);
    },
  });

  const { showAnimation } = useAnimationConfig(result);

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-lg mb-0 break-words">{functionFragment.name}</h3>
        <button className={`btn btn-ghost btn-xs ${isFetching ? "loading" : ""}`} onClick={async () => await refetch()}>
          {!isFetching && <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />}
        </button>
      </div>
      <div className="text-gray-500 font-medium flex flex-col items-start">
        <div>
          <div
            className={`break-words block transition bg-transparent ${
              showAnimation ? "bg-warning rounded-sm animate-pulse-fast" : ""
            }`}
          >
            {displayTxResult(result)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayVariable;
