const axios = require("axios");
const PINATA_JWT =
  "eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMmYyMGMwOS1kMDE1LTQ2MTEtYmM1YS02NzdkYzY5Zjk5MzMiLCJlbWFpbCI6InNjb2JydTE5ODhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImMwNGFkOGJlYzliM2Q1NWJjNDc5Iiwic2NvcGVkS2V5U2VjcmV0IjoiOTQ3ODRhMzNmYjI3YzBiZTE5YWU0MjM2MmJjMjRlMWFlYTBlNTZkMjVlY2U2NTY1ZTc1ODM4ZjJlNTdlYjlkMSIsImlhdCI6MTY5NTIzOTc4OH0._FwITlqcuVnLkT40tozVXsAyx_tDbYDGTClVv6mT8L4";
const PIN_QUERY = "https://api.pinata.cloud/data/pinList?status=pinned&includesCount=false&pageLimit=1000";

let pinHashes = [];

const deletePinFromIPFS = async hashToUnpin => {
  try {
    const res = await axios.delete(`https://api.pinata.cloud/pinning/unpin/${hashToUnpin}`, {
      headers: {
        Authorization: PINATA_JWT,
      },
    });
    console.log(`Successfully deleted ${hashToUnpin}`);
  } catch (error) {
    console.log("Error deleting pin:", error.response ? error.response.data : error);
  }
};

const wait = async time => new Promise(resolve => setTimeout(resolve, time));


const fetchPins = async () => {
  try {
    const res = await axios.get(PIN_QUERY, {
      headers: {
        Authorization: PINATA_JWT
      }
    })
    const responseData = res.data.rows
    responseData.forEach(row => {
      pinHashes.push(row.ipfs_pin_hash)
    })
    console.log(pinHashes)
  } catch (error) {
    console.log(error)
  }
}


const bulkUnpin = async () => {
  try {
    for (const hash of pinHashes) {
      await deletePinFromIPFS(hash)
      await wait(200)
    }
    pinHashes = []
  } catch (error) {
    console.log(error)
  }
}

const main = async () => {
  await fetchPins()
  while (pinHashes) {
    await bulkUnpin()
    await fetchPins()
  }
}

main();
