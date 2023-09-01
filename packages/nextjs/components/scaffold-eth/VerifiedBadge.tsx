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
      <div className="badge badge-primary p-4 hover:text-black w-fit bg-success rounded-full">
        <span className="font-semibold "> Verified</span>
        {newVerified == "verified" ? (
          <div className="badge-success ml-2">✅</div>
        ) : (
          <div className="badge-error ml-2">❌</div>
        )}
      </div>
    </>
  );
}
