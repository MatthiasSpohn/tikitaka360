import algosdk from "algosdk";
import { CID, Version } from "multiformats/cid"
import * as mfsha2 from "multiformats/hashes/sha2";
import * as digest from "multiformats/hashes/digest";

export function ipfsDecoderDecode(url: string, reserveAddr: string): string {
    const chunks = url.split("://");
    const IPFSProxyPath = "https://ipfs.io/ipfs/";
    // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be
    if (chunks[0] === "template-ipfs" && chunks[1].startsWith("{ipfscid:")) {
        // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
        chunks[0] = "ipfs";
        const cidComponents = chunks[1].split(":");
        if (cidComponents.length !== 5) {
            // give up
            console.log("unknown ipfscid format");
            return url;
        }
        const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents;

        // const cidVersionInt = parseInt(cidVersion) as CIDVersion
        if (cidHash.split("}")[0] !== "sha2-256") {
            console.log("unsupported hash:", cidHash);
            return url;
        }
        if (cidCodec !== "raw" && cidCodec !== "dag-pb") {
            console.log("unsupported codec:", cidCodec);
            return url;
        }
        if (asaField !== "reserve") {
            console.log("unsupported asa field:", asaField);
            return url;
        }
        let cidCodecCode;
        if (cidCodec === "raw") {
            cidCodecCode = 0x55;
        } else if (cidCodec === "dag-pb") {
            cidCodecCode = 0x70;
        }

        if (!cidCodecCode) {
            throw new Error("unknown codec");
        }

        // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
        const addr = algosdk.decodeAddress(reserveAddr);
        const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey);
        const version = parseInt(cidVersion) as Version;

        const cid = CID.create(version, cidCodecCode, mhdigest);
        chunks[1] = cid.toString() + "/" + chunks[1].split("/").slice(1).join("/");
    }

    //Switch on the protocol
    switch (chunks[0]) {
        case "ipfs": {
            return IPFSProxyPath + chunks[1];
        }
        case "https": //Its already http, just return it
            return url;
    }

    return url;
}
