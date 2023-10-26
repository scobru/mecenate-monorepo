import { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, createHttpLink, gql } from "@apollo/client";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useInterval } from "usehooks-ts";
import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { toUtf8String } from "ethers/lib/utils.js";
import { Signer, ethers } from "ethers";
import Link from "next/link";

const ErasureHelper = require("@erasure/crypto-ipfs");

type TAttestation = {
  id: string;
  attester: string;
  recipient: string;
  data: string;
  timeCreated: number;
};

const Attestations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [attestations, setAttestations] = useState<TAttestation[]>([]);
  const [ipfsHashes, setIpfsHashes] = useState<string[]>([]);

  const schemaEncoder = new SchemaEncoder("bool verified ,address feed, bytes post,");

  const graphUri = "https://base-goerli-predeploy.easscan.org/graphql";

  const httpLink = createHttpLink({
    uri: graphUri,
  });

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  const getAttestationsGraphQl = gql`
    query Attestation($where: AttestationWhereInput) {
      attestations(where: $where) {
        attester
        recipient
        data
        timeCreated
        id
      }
    }
  `;

  const fetchAttestations = async () => {
    console.log("attests");

    const newAttestations = await apolloClient.query({
      query: getAttestationsGraphQl,
      variables: {
        where: { schemaId: { equals: "0xb73edc40219f8224352f6d9c12364faadae4e09726e78d0e9e78bea456930b5a" } },
      },
    });

    setIsLoading(false);

    console.log("newAttestations: ", newAttestations);

    setAttestations(newAttestations.data.attestations);
  };

  useEffect(() => {
    (async () => {
      await fetchAttestations();
    })();
  }, []);

  useInterval(async () => {
    await fetchAttestations();
  }, scaffoldConfig.pollingInterval);

  async function getIPFSHash(data: string, index: number): Promise<void> {
    const hash: string = await ErasureHelper.multihash({
      input: data,
      inputType: "sha2-256",
      outputType: "b58",
    });

    console.log("hash: ", hash);

    const newIpfsHashes = [...ipfsHashes];
    newIpfsHashes[index] = hash;
    setIpfsHashes(newIpfsHashes);
  }

  useEffect(() => {
    attestations.forEach((attestation, index) => {
      getIPFSHash(schemaEncoder.decodeData(attestation.data)[2].value.value.toString(), index);
    });
  }, [attestations]);

  return (
    <div className="flex flex-col justify-center items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div className="flex justify-center overflow-x-auto md:overflow-visible">
        <div className="w-full md:min-w-full shadow-lg">
          <table className="table-auto md:table-zebra w-full">
            <thead>
              <tr>
                <th className="bg-primary text-white p-1.5 sml:p-4">UID</th>
                <th className="bg-primary text-white p-1.5 sml:p-4">BUYER</th>
                <th className="bg-primary text-white p-1.5 sml:p-4">SELLER</th>
                <th className="bg-primary text-white p-1.5 sml:p-4">RESOLVED</th>
                <th className="bg-primary text-white p-1.5 sml:p-4">FEED</th>
                <th className="bg-primary text-white p-1.5 sml:p-4">POST</th>
                <th className="bg-primary text-white p-1.5 sml:p-4">CREATED AT</th>
              </tr>
            </thead>
            <tbody>
              {attestations.map((attestation, index) => {
                return (
                  <tr
                    key={attestation.id}
                    className="md:table-row hover text-sm bg-base-200 hover:bg-base-300 transition-colors duration-200 p-2 md:p-0"
                  >
                    <td className="md:table-cell p-1 md:p-2">
                      <a
                        href={`https://base-goerli-predeploy.easscan.org/attestation/view/${attestation.id}`}
                        title={attestation.id}
                        target="_blank"
                        rel="noreferrer"
                        className="flex"
                      >
                        <span className="list__container--first_row-data">{attestation.id.slice(0, 20)}</span>...
                      </a>
                    </td>
                    <td className="md:table-cell p-1 md:p-2">
                      <Address address={attestation.attester} size="sm" />
                    </td>
                    <td className="md:table-cell p-1 md:p-2">
                      <Address address={attestation.recipient} size="sm" />
                    </td>
                    <td className="md:table-cell p-1 md:p-2">
                      {schemaEncoder.decodeData(attestation.data)[0].value.value.toString()}
                    </td>
                    <td className="md:table-cell p-1 md:p-2">
                      <Address
                        address={schemaEncoder.decodeData(attestation.data)[1].value.value.toString()}
                        size="sm"
                      />
                    </td>
                    <td className="md:table-cell p-1 md:p-2">
                      <Link className="link-hover " href={`https://ipfs.io/ipfs/${ipfsHashes[index]}`} target="_blank">
                        ipfs
                      </Link>
                    </td>
                    <td className="md:table-cell p-1 md:p-2">
                      {new Date(attestation.timeCreated * 1000).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attestations;
