import { useEffect } from "react";
import { Address } from ".";
import React from "react";

type TVerifiedProps = {
  sismoData?: any;
  verified?: string;
};

export default function VerifiedBadge({ sismoData, verified }: TVerifiedProps) {
  const [newSismoData, setNewSismoData] = React.useState<any>(null);
  const [newVerified, setNewVerified] = React.useState<string>("");

  useEffect(() => {
    setNewSismoData(sismoData);
    setNewVerified(String(verified));
  }, [sismoData, verified]);

  return (
    <>
      <div className="text-left my-10">
        <div className="text-left p-5 bg-white hover:bg-blue-200 font-semibold border-1 text-black w-fit rounded-md">
          <Address address={newSismoData?.userId || null} format="long" />
          Verified{" "}
          {newVerified == "verified" ? (
            <span className="text-green-500">✅</span>
          ) : (
            <span className="text-red-500">❌</span>
          )}
        </div>
      </div>
    </>
  );
}
