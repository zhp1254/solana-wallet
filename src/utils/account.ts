import EdDSA from "elliptic";
import BN from "bn.js";
import bs58 from 'bs58';

export function getPublic(_priv : string) {
    const priv = new BN(_priv, 16)
    const eddsa =  new EdDSA.eddsa("ed25519")
    const pub = eddsa.encodePoint(eddsa.g.mul(priv))
    console.log(Buffer.from(pub).toString('hex'))

   return pub
}

export function getSolanaAddress(_priv : string) {
    const priv = new BN(_priv, 16)
    const eddsa =  new EdDSA.eddsa("ed25519")
    const pub = eddsa.encodePoint(eddsa.g.mul(priv))
    console.log(Buffer.from(pub).toString('hex'))

    const address = bs58.encode(pub);
    console.log("address: ", address)
    return address
}

export function sign (_priv: string, message: Uint8Array ){
    console.log(_priv)
    console.log(Buffer.from(message).toString('hex'))

    const priv = new BN(_priv, 16)
    const eddsa =  new EdDSA.eddsa("ed25519")
    const pub = eddsa.encodePoint(eddsa.g.mul(priv))

    let r = eddsa.hashInt(priv.toArray(), message);
    let R = eddsa.g.mul(r);
    let Rencoded = eddsa.encodePoint(R);


    let s_ = eddsa.hashInt(Rencoded, pub, message)
        .mul(priv);
    let S = r.add(s_).umod(eddsa.curve.n);
    return eddsa.makeSignature({ R: R, S: S, Rencoded: Rencoded }).toBytes();
}